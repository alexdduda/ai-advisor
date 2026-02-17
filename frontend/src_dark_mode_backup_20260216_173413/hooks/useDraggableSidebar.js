import { useState, useEffect } from 'react'

/**
 * Manages the draggable toggle-button for a collapsible sidebar.
 *
 * @param {boolean} isOpen   – current open state of the sidebar
 * @returns {{ toggleY, isDragging, handleMouseDown, handleTouchStart }}
 */
export default function useDraggableSidebar(isOpen) {
  const [toggleY, setToggleY] = useState(20)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartPos, setDragStartPos] = useState(0)

  const clampY = (raw) => Math.max(20, Math.min(window.innerHeight - 56, raw))

  // --- pointer-down starters (only active when sidebar is closed) ---
  const handleMouseDown = (e) => {
    if (isOpen) return
    setIsDragging(true)
    setDragStartY(e.clientY)
    setDragStartPos(toggleY)
    e.preventDefault()
  }

  const handleTouchStart = (e) => {
    if (isOpen) return
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
    setDragStartPos(toggleY)
    e.preventDefault()
  }

  // --- window-level move/up listeners (only while dragging) ---
  useEffect(() => {
    if (!isDragging) return

    const onMove = (clientY) => {
      setToggleY(clampY(dragStartPos + (clientY - dragStartY)))
    }

    const handleMouseMove  = (e) => onMove(e.clientY)
    const handleTouchMove  = (e) => onMove(e.touches[0].clientY)
    const handleEnd        = ()  => setIsDragging(false)

    window.addEventListener('mousemove',  handleMouseMove)
    window.addEventListener('mouseup',    handleEnd)
    window.addEventListener('touchmove',  handleTouchMove,  { passive: false })
    window.addEventListener('touchend',   handleEnd)

    return () => {
      window.removeEventListener('mousemove',  handleMouseMove)
      window.removeEventListener('mouseup',    handleEnd)
      window.removeEventListener('touchmove',  handleTouchMove)
      window.removeEventListener('touchend',   handleEnd)
    }
  }, [isDragging, dragStartY, dragStartPos])

  return { toggleY, isDragging, handleMouseDown, handleTouchStart }
}
