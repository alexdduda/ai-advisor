import { useRef } from 'react'
import { HiPaperClip, HiDocument, HiPhotograph, HiDocumentText, HiX } from 'react-icons/hi'
import './FileUpload.css'

export default function FileUpload({ onFilesSelected, attachedFiles, onRemoveFile }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate files
    const validFiles = files.filter(file => {
      const maxSize = 32 * 1024 * 1024 // 32MB
      const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/csv',
        'text/markdown'
      ]
      
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 32MB.`)
        return false
      }
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type. Supported: PDF, Images, Text files.`)
        return false
      }
      
      return true
    })
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
    
    // Reset input
    e.target.value = ''
  }

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return <HiDocument />
    if (fileType.startsWith('image/')) return <HiPhotograph />
    return <HiDocumentText />
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="file-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.md"
        onChange={handleFileSelect}
        multiple
        style={{ display: 'none' }}
      />
      
      <button
        type="button"
        className="attach-file-btn"
        onClick={() => fileInputRef.current?.click()}
        title="Attach files (PDF, Images, Text)"
      >
        <HiPaperClip />
      </button>

      {attachedFiles && attachedFiles.length > 0 && (
        <div className="attached-files-list">
          {attachedFiles.map((file, index) => (
            <div key={index} className="attached-file-item">
              <div className="file-icon">{getFileIcon(file.type)}</div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => onRemoveFile(index)}
                title="Remove file"
              >
                <HiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}