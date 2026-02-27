import { useState, useEffect } from 'react'
import { MAJORS, MINORS, FACULTIES, ENVIRONMENT_MAJORS, LAW_MAJORS, AES_MAJORS, DENTISTRY_PROGRAMS } from '../../utils/mcgillData'
import './EnhancedProfileForm.css'

const BASC_PROGRAMS = [
  'Cognitive Science',
  'Cognitive Science (Honours)',
  'Sustainability, Science and Society',
  'Sustainability, Science and Society (Honours)',
  'Environment',
  'Environment (Honours)',
]

const isBasc = (faculty) => faculty === 'Bachelor of Arts and Science'
const isEnv  = (faculty) => faculty === 'School of Environment'
const isLaw  = (faculty) => faculty === 'Faculty of Law'
const isAes  = (faculty) => faculty === 'Faculty of Agricultural and Environmental Sciences'
const isDentistry = (faculty) => faculty === 'Faculty of Dental Medicine and Oral Health Sciences'

export default function EnhancedProfileForm({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    major: '',
    other_majors: [], // Array of additional majors
    minor: '',
    other_minors: [], // Array of additional minors
    concentration: '',
    faculty: '',
    year: '',
    interests: '',
    current_gpa: '',
    advanced_standing: [] // Array of {course_code, course_title, credits}
  })

  const [showMajorDropdown, setShowMajorDropdown] = useState(false)
  const [showMinorDropdown, setShowMinorDropdown] = useState(false)
  const [showAdvancedStanding, setShowAdvancedStanding] = useState(false)
  const [newAdvancedCourse, setNewAdvancedCourse] = useState({
    course_code: '',
    course_title: '',
    credits: 3
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        major: profile.major || '',
        other_majors: profile.other_majors || [],
        minor: profile.minor || '',
        other_minors: profile.other_minors || [],
        concentration: profile.concentration || '',
        faculty: profile.faculty || '',
        year: profile.year || '',
        interests: profile.interests || '',
        current_gpa: profile.current_gpa || '',
        advanced_standing: (profile.advanced_standing || []).map(c => ({
          counts_toward_degree: true,
          counts_toward_major: false,
          ...c,
        }))
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddMajor = (major) => {
    if (!formData.other_majors.includes(major) && major !== formData.major) {
      setFormData(prev => ({
        ...prev,
        other_majors: [...prev.other_majors, major]
      }))
    }
    setShowMajorDropdown(false)
  }

  const handleRemoveMajor = (major) => {
    setFormData(prev => ({
      ...prev,
      other_majors: prev.other_majors.filter(m => m !== major)
    }))
  }

  const handleAddMinor = (minor) => {
    if (!formData.other_minors.includes(minor) && minor !== formData.minor) {
      setFormData(prev => ({
        ...prev,
        other_minors: [...prev.other_minors, minor]
      }))
    }
    setShowMinorDropdown(false)
  }

  const handleRemoveMinor = (minor) => {
    setFormData(prev => ({
      ...prev,
      other_minors: prev.other_minors.filter(m => m !== minor)
    }))
  }

  const handleAddAdvancedCourse = () => {
    if (newAdvancedCourse.course_code) {
      setFormData(prev => ({
        ...prev,
        advanced_standing: [...prev.advanced_standing, {
          course_code: newAdvancedCourse.course_code,
          course_title: newAdvancedCourse.course_title || null,
          credits: newAdvancedCourse.credits,
          counts_toward_degree: true,
          counts_toward_major: false,
        }]
      }))
      setNewAdvancedCourse({ course_code: '', course_title: '', credits: 3 })
    }
  }

  const handleToggleAdvancedFlag = (index, flag) => {
    setFormData(prev => ({
      ...prev,
      advanced_standing: prev.advanced_standing.map((c, i) =>
        i === index ? { ...c, [flag]: !c[flag] } : c
      )
    }))
  }

  const handleRemoveAdvancedCourse = (index) => {
    setFormData(prev => ({
      ...prev,
      advanced_standing: prev.advanced_standing.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Clean the form data before sending
    const cleanedData = {}
    
    // FIXED: For optional string fields, send null if empty (not empty string)
    // This allows the database to properly clear/update the field
    
    // Optional fields - send null to clear, or trimmed value if not empty
    const trimmedUsername = formData.username?.trim()
    cleanedData.username = trimmedUsername || null
    
    const trimmedMinor = formData.minor?.trim()
    cleanedData.minor = trimmedMinor || null
    
    const trimmedConcentration = formData.concentration?.trim()
    cleanedData.concentration = trimmedConcentration || null
    
    const trimmedInterests = formData.interests?.trim()
    cleanedData.interests = trimmedInterests || null
    
    // Required fields - keep empty string for validation
    cleanedData.major = formData.major?.trim() || ""
    cleanedData.faculty = formData.faculty?.trim() || ""
    
    // Year - send null if empty
    cleanedData.year = formData.year ? parseInt(formData.year) : null
    
    // GPA - validate and send null if invalid or empty
    if (formData.current_gpa) {
      const gpa = parseFloat(formData.current_gpa)
      if (!isNaN(gpa) && gpa >= 0 && gpa <= 4) {
        cleanedData.current_gpa = gpa
      } else {
        cleanedData.current_gpa = null
      }
    } else {
      cleanedData.current_gpa = null
    }
    
    // Arrays - send empty array if no items, or filtered array if has items
    if (formData.other_majors?.length > 0) {
      cleanedData.other_majors = [...new Set(formData.other_majors.filter(m => m?.trim()))]
    } else {
      cleanedData.other_majors = []
    }
    
    if (formData.other_minors?.length > 0) {
      cleanedData.other_minors = [...new Set(formData.other_minors.filter(m => m?.trim()))]
    } else {
      cleanedData.other_minors = []
    }
    
    if (formData.advanced_standing?.length > 0) {
      cleanedData.advanced_standing = formData.advanced_standing.filter(
        course => course.course_code?.trim()
      )
    } else {
      cleanedData.advanced_standing = []
    }
    
    console.log('🔵 EnhancedProfileForm: Submitting cleaned data:', cleanedData)
    console.log('  - username:', JSON.stringify(cleanedData.username), '(type:', typeof cleanedData.username, ')')
    console.log('  - minor:', JSON.stringify(cleanedData.minor), '(type:', typeof cleanedData.minor, ')')
    console.log('  - concentration:', JSON.stringify(cleanedData.concentration), '(type:', typeof cleanedData.concentration, ')')
    console.log('  - interests:', JSON.stringify(cleanedData.interests), '(type:', typeof cleanedData.interests, ')')
    onSave(cleanedData)
  }

  return (
    <form onSubmit={handleSubmit} className="enhanced-profile-form">
      {/* Section 1: Basic Information */}
      <div className="form-section">
        <div className="section-number">1</div>
        <div className="section-content-wrapper">
          <div className="section-title-group">
            <h3 className="section-title">Basic Information</h3>
            <p className="section-subtitle">Enter Username</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">
                Username
                <span className="optional-badge">Optional</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your display name"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Academic Information */}
      <div className="form-section">
        <div className="section-number">2</div>
        <div className="section-content-wrapper">
          <div className="section-title-group">
            <h3 className="section-title">Academic Information</h3>
            <p className="section-subtitle">Your faculty, program, and year of study</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="faculty">
                Faculty <span className="required-star">*</span>
              </label>
              <select
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                required
              >
                <option value="">Select your faculty</option>
                {FACULTIES.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Academic Year</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="">Select year</option>
                <option value="0">U0 (Foundation)</option>
                <option value="1">U1</option>
                <option value="2">U2</option>
                <option value="3">U3</option>
                <option value="4">U4</option>
                <option value="5+">U5+</option>
              </select>
            </div>
          </div>

          {/* B.A. & Sc. specific program selection */}
          {isBasc(formData.faculty) ? (
            <>
              {/* Stream selector */}
              <div className="form-group">
                <label htmlFor="basc-stream">
                  Program Stream <span className="required-star">*</span>
                </label>
                <select
                  id="basc-stream"
                  value={
                    formData.concentration === 'Multi-track' || formData.concentration === 'Joint Honours'
                      ? formData.concentration
                      : 'Interfaculty'
                  }
                  onChange={(e) => {
                    const stream = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      concentration: stream === 'Interfaculty' ? '' : stream,
                      major: '',
                      other_majors: [],
                    }))
                  }}
                >
                  {BASC_STREAMS.map(s => (
                    <option key={s.value} value={s.value}>{s.label} — {s.description}</option>
                  ))}
                </select>
              </div>

              {/* Interfaculty/Honours stream */}
              {(!formData.concentration || (!bascIsMultiTrack(formData.concentration))) && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="major">
                      Interfaculty Program <span className="required-star">*</span>
                    </label>
                    <select
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                    >
                      <option value="">Select your program</option>
                      {BASC_INTERFACULTY_PROGRAMS.map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                    <span className="helper-text">The interfaculty concentration you are completing</span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="minor">Minor (optional)</label>
                    <select id="minor" name="minor" value={formData.minor} onChange={handleChange}>
                      <option value="">Select a minor</option>
                      {MINORS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Multi-track / Joint Honours stream */}
              {bascIsMultiTrack(formData.concentration) && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="major">
                        Arts Concentration <span className="required-star">*</span>
                      </label>
                      <select id="major" name="major" value={formData.major} onChange={handleChange}>
                        <option value="">Select Arts program</option>
                        {ARTS_MAJORS_BASC.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <span className="helper-text">36-credit Arts major concentration</span>
                    </div>
                    <div className="form-group">
                      <label>
                        Science Concentration <span className="required-star">*</span>
                      </label>
                      <select
                        value={formData.other_majors[0] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          other_majors: e.target.value ? [e.target.value] : []
                        }))}
                      >
                        <option value="">Select Science program</option>
                        {SCIENCE_MAJORS_BASC.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <span className="helper-text">36-credit Science major concentration</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="minor">Minor (optional)</label>
                    <select id="minor" name="minor" value={formData.minor} onChange={handleChange}>
                      <option value="">Select a minor</option>
                      {MINORS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Non-BASC: standard major/minor/additional */
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="major">
                    Primary Major <span className="required-star">*</span>
                  </label>
                  <select
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your major</option>
                    {(isEnv(formData.faculty) ? ENVIRONMENT_MAJORS : isLaw(formData.faculty) ? LAW_MAJORS : isAes(formData.faculty) ? AES_MAJORS : isDentistry(formData.faculty) ? DENTISTRY_PROGRAMS : MAJORS).map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="minor">Minor</label>
                  <select id="minor" name="minor" value={formData.minor} onChange={handleChange}>
                    <option value="">Select a minor (optional)</option>
                    {MINORS.map(minor => (
                      <option key={minor} value={minor}>{minor}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Majors */}
              <div className="form-group">
                <label>
                  Additional Majors
                  <span className="helper-text">For double/joint majors</span>
                </label>
                <div className="multi-select-container">
                  {formData.other_majors.map(major => (
                    <div key={major} className="selected-tag">
                      <span>{major}</span>
                      <button type="button" onClick={() => handleRemoveMajor(major)} className="remove-tag">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setShowMajorDropdown(!showMajorDropdown)} className="add-more-btn">
                    + Add Major
                  </button>
                </div>
                {showMajorDropdown && (
                  <div className="dropdown-list">
                    {MAJORS.filter(m => m !== formData.major && !formData.other_majors.includes(m)).map(major => (
                      <button key={major} type="button" onClick={() => handleAddMajor(major)} className="dropdown-item">{major}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Minors */}
              <div className="form-group">
                <label>
                  Additional Minors
                  <span className="helper-text">If you have multiple minors</span>
                </label>
                <div className="multi-select-container">
                  {formData.other_minors.map(minor => (
                    <div key={minor} className="selected-tag">
                      <span>{minor}</span>
                      <button type="button" onClick={() => handleRemoveMinor(minor)} className="remove-tag">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setShowMinorDropdown(!showMinorDropdown)} className="add-more-btn">
                    + Add Minor
                  </button>
                </div>
                {showMinorDropdown && (
                  <div className="dropdown-list">
                    {MINORS.filter(m => m !== formData.minor && !formData.other_minors.includes(m)).map(minor => (
                      <button key={minor} type="button" onClick={() => handleAddMinor(minor)} className="dropdown-item">{minor}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="concentration">
                  Concentration / Specialization
                  <span className="helper-text">e.g., AI/ML, Software Systems</span>
                </label>
                <input
                  type="text"
                  id="concentration"
                  name="concentration"
                  value={formData.concentration}
                  onChange={handleChange}
                  placeholder="Your area of focus"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 3: Academic Performance & Interests */}
      <div className="form-section">
        <div className="section-number">3</div>
        <div className="section-content-wrapper">
          <div className="section-title-group">
            <h3 className="section-title">Performance & Interests</h3>
            <p className="section-subtitle">Help us personalize your experience</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current_gpa">
                Current GPA
                <span className="helper-text">Scale of 0.0 - 4.0</span>
              </label>
              <input
                type="number"
                id="current_gpa"
                name="current_gpa"
                value={formData.current_gpa}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="4.0"
                placeholder="e.g., 3.75"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="interests">
              Academic Interests
              <span className="helper-text">Separate with commas</span>
            </label>
            <textarea
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g., Machine Learning, Web Development, Data Science"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Advanced Standing */}
      <div className="form-section advanced-standing-section">
        <div className="section-number">4</div>
        <div className="section-content-wrapper">
          <div className="section-header">
            <div className="section-title-group">
              <h3 className="section-title">Advanced Standing</h3>
              <p className="section-subtitle">AP, IB, or transfer credits</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedStanding(!showAdvancedStanding)}
              className="toggle-section-btn"
            >
              {showAdvancedStanding ? '− Hide' : '+ Add Credits'}
            </button>
          </div>

          {formData.advanced_standing.length > 0 && (
            <div className="credits-summary">
              <strong>{formData.advanced_standing.length} course{formData.advanced_standing.length !== 1 ? 's' : ''}</strong> • 
              <strong> {formData.advanced_standing.reduce((sum, c) => sum + (c.credits || 0), 0)} credits</strong> from AP/IB/transfer
            </div>
          )}

          {showAdvancedStanding && (
            <div className="advanced-standing-form">
              <p className="section-description">
                Add McGill courses you received credit for through AP, IB, A-Levels, or transfer credits
              </p>

              {/* List of existing advanced standing */}
              {formData.advanced_standing.length > 0 && (
                <div className="advanced-courses-list">
                  {formData.advanced_standing.map((course, index) => (
                    <div key={index} className="advanced-course-card">
                      <div className="advanced-course-card-header">
                        <span className="course-code">{course.course_code}</span>
                        <span className="course-credits">{course.credits} cr</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdvancedCourse(index)}
                          className="remove-chip-btn"
                          title="Remove"
                        >✕</button>
                      </div>
                      <div className="advanced-course-toggles">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={course.counts_toward_degree !== false}
                            onChange={() => handleToggleAdvancedFlag(index, 'counts_toward_degree')}
                          />
                          <span>Counts toward degree total</span>
                        </label>
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={!!course.counts_toward_major}
                            onChange={() => handleToggleAdvancedFlag(index, 'counts_toward_major')}
                          />
                          <span>Counts toward major / minor</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new advanced standing */}
              <div className="add-advanced-course">
                <input
                  type="text"
                  placeholder="Course code (e.g., MATH140, COMP202)"
                  value={newAdvancedCourse.course_code}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase().replace(/\s/g, '');
                    setNewAdvancedCourse(prev => ({
                      ...prev,
                      course_code: code
                    }))
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAdvancedCourse();
                    }
                  }}
                  className="course-code-input"
                />
                <select
                  value={newAdvancedCourse.credits}
                  onChange={(e) => setNewAdvancedCourse(prev => ({
                    ...prev,
                    credits: parseInt(e.target.value)
                  }))}
                  className="credits-select"
                >
                  <option value="3">3 credits</option>
                  <option value="4">4 credits</option>
                  <option value="6">6 credits</option>
                  <option value="1">1 credit</option>
                  <option value="2">2 credits</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddAdvancedCourse}
                  className="add-course-btn"
                  disabled={!newAdvancedCourse.course_code}
                >
                  Add
                </button>
              </div>

              <div className="common-credits-hint">
                <strong>Common examples:</strong> MATH140, MATH141, CHEM110, PHYS131, COMP202, BIOL111, ECON208, PSYC100
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Profile
        </button>
      </div>
    </form>
  )
}
