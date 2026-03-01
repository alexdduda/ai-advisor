import React, { useState, useMemo } from 'react'
import {
  FaGlobe, FaUniversity, FaPlane,
  FaMapMarkerAlt, FaClock, FaExternalLinkAlt,
  FaChevronDown, FaChevronUp, FaSearch, FaRegBookmark, FaBookmark,
  FaGraduationCap, FaUsers, FaInfoCircle
} from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import './StudyAbroadView.css'

const PROGRAM_TYPES = [
  { id: 'all',         label: 'All' },
  { id: 'exchange',    label: 'Exchange' },
  { id: 'field',       label: 'Field Studies' },
  { id: 'courses',     label: 'Courses Abroad' },
  { id: 'internship',  label: 'Internship / Co-op' },
  { id: 'iut',         label: 'IUT / Study Away' },
]

const REGIONS = [
  { id: 'all',           label: 'All Regions' },
  { id: 'europe',        label: 'Europe' },
  { id: 'americas',      label: 'Americas' },
  { id: 'asia_pacific',  label: 'Asia-Pacific' },
  { id: 'africa_middle', label: 'Africa & Middle East' },
  { id: 'canada',        label: 'Canada' },
]

const TYPE_LABELS = {
  exchange:   'Exchange',
  field:      'Field Study',
  courses:    'Courses Abroad',
  internship: 'Internship',
  iut:        'IUT / Study Away',
}

const PROGRAMS = [
  {
    id: 'exchange_main', type: 'exchange',
    title: 'McGill Student Exchange Program',
    institution: '160+ Partner Universities',
    regions: ['europe', 'americas', 'asia_pacific', 'africa_middle'],
    country: 'Worldwide · 39 countries',
    duration: '1–2 semesters', credits: 'Up to 30 credits',
    faculties: null,
    description: "Complete a semester or full year at one of McGill's bilateral partner universities. You pay McGill tuition, earn credit toward your degree, and your transcript records the exchange with transfer credits. Spaces are limited and competitive.",
    eligibility: ['Full-time, degree-seeking McGill student', 'Minimum CGPA 3.0', 'At least 24 McGill credits completed by start of exchange'],
    deadlines: [{ label: 'Fall / Full-Year 2026', date: 'December 1, 2025 – January 15, 2026' }, { label: 'Winter 2027', date: 'April – June 2026 (dates TBC)' }],
    notes: 'Host institution grades do NOT appear on your McGill transcript or affect CGPA. A non-refundable application fee applies.',
    links: [{ label: 'McGill Abroad – Exchange', url: 'https://www.mcgill.ca/mcgillabroad/go-abroad/steps/apply' }, { label: 'Partner Universities', url: 'https://www.mcgill.ca/mcgillabroad/go-abroad/steps/destinations' }],
  },
  {
    id: 'exchange_management', type: 'exchange',
    title: 'Desautels International Student Exchange',
    institution: 'Top Business Schools Worldwide',
    regions: ['europe', 'americas', 'asia_pacific'],
    country: 'Worldwide', duration: '1 semester', credits: '15 credits',
    faculties: ['Desautels Faculty of Management'],
    description: 'Faculty-specific exchange for BCom students with top-ranked business schools in Europe, Asia, and the Americas.',
    eligibility: ['Enrolled in a BCom program at Desautels', 'Strong academic standing'],
    deadlines: [{ label: 'Application', date: 'Check Desautels International Programs website' }],
    notes: null,
    links: [{ label: 'Desautels International Exchange', url: 'https://www.mcgill.ca/desautels/programs/bcom/academics/exchange/student-going-abroad' }],
  },
  {
    id: 'exchange_law', type: 'exchange',
    title: 'Faculty of Law Exchange Program',
    institution: 'Leading Law Schools Worldwide',
    regions: ['europe', 'americas', 'asia_pacific'],
    country: 'Worldwide', duration: '1 semester', credits: 'Variable',
    faculties: ['Faculty of Law'],
    description: 'Approximately 25% of McGill law students study abroad. Strong partnerships with leading law schools globally. Credited summer Human Rights Internships through CHRLP are also available.',
    eligibility: ['Enrolled in BCL/LLB program at McGill Law'],
    deadlines: [{ label: 'Application', date: 'Contact Faculty of Law Student Affairs Office' }],
    notes: 'Summer Human Rights Internships through CHRLP count for course credit.',
    links: [{ label: 'Law Exchange Programs', url: 'https://www.mcgill.ca/law/students/student-affairs/exchange' }, { label: 'CHRLP Internships', url: 'https://www.mcgill.ca/humanrights/clinical/internships' }],
  },
  {
    id: 'field_east_africa', type: 'field',
    title: 'Field Studies – East Africa',
    institution: 'McGill University (off-campus)',
    regions: ['africa_middle'], country: 'Kenya / East Africa',
    duration: '1 semester', credits: '15 credits', faculties: ['Faculty of Arts'],
    description: 'Semester-long immersive program in East Africa taught by McGill professors. Students apply classroom knowledge to development, conservation, and social science challenges. McGill tuition applies.',
    eligibility: ['Arts, Science, or B.A.&Sc. students', 'Completed at least one year at McGill', 'Application and interview required'],
    deadlines: [{ label: 'Application', date: 'Check Arts OASIS – Study Away portal' }],
    notes: 'Field study credits can count toward major program requirements in many Arts programs.',
    links: [{ label: 'Arts OASIS – Field Studies', url: 'https://www.mcgill.ca/oasis/away' }],
  },
  {
    id: 'field_barbados', type: 'field',
    title: 'Field Studies – Barbados',
    institution: 'McGill University (off-campus)',
    regions: ['americas'], country: 'Barbados',
    duration: '1 semester', credits: '15 credits', faculties: ['Faculty of Arts'],
    description: 'Semester in Barbados focusing on Caribbean studies, ecology, history, and society. Courses taught by McGill faculty with local institutions.',
    eligibility: ['Arts and related students', 'Completed first year at McGill'],
    deadlines: [{ label: 'Application', date: 'Check Arts OASIS – Study Away portal' }],
    notes: null,
    links: [{ label: 'Arts OASIS – Study Away', url: 'https://www.mcgill.ca/oasis/away' }],
  },
  {
    id: 'field_panama', type: 'field',
    title: 'Field Studies – Panama',
    institution: 'McGill University (off-campus)',
    regions: ['americas'], country: 'Panama',
    duration: '1 semester', credits: '15 credits', faculties: ['Faculty of Arts'],
    description: 'Semester program centered on tropical ecology, biodiversity, indigenous cultures, and sustainable development. Taught by McGill professors with on-the-ground fieldwork.',
    eligibility: ['Arts and related students', 'Completed first year at McGill'],
    deadlines: [{ label: 'Application', date: 'Check Arts OASIS – Study Away portal' }],
    notes: null,
    links: [{ label: 'Arts OASIS – Study Away', url: 'https://www.mcgill.ca/oasis/away' }],
  },
  {
    id: 'field_science_minor', type: 'field',
    title: 'Field Studies Minor – Science',
    institution: 'McGill University',
    regions: ['americas', 'africa_middle', 'asia_pacific', 'europe'],
    country: 'Various international destinations',
    duration: 'Variable (multiple terms)', credits: '18 credits (minor)', faculties: ['Faculty of Science'],
    description: 'An 18-credit minor combining field courses in diverse natural settings. Offers hands-on application of scientific methods outside the lab. Contact IFSO for available destinations.',
    eligibility: ['Enrolled in a B.Sc. program'],
    deadlines: [{ label: 'Inquiries', date: 'ifso.science@mcgill.ca' }],
    notes: null,
    links: [{ label: 'Science Field Studies', url: 'https://www.mcgill.ca/science/undergraduate/internships-field/field' }],
  },
  {
    id: 'courses_abroad', type: 'courses',
    title: 'McGill Courses Taught Abroad',
    institution: 'McGill University',
    regions: ['europe', 'americas', 'asia_pacific', 'africa_middle'],
    country: 'Various (changes each year)',
    duration: 'Short course or full summer', credits: '3–6 credits per course', faculties: null,
    description: 'Short courses designed by McGill professors at international locations. Earn full McGill credits at McGill tuition rates. Listings change annually.',
    eligibility: ['Open to all McGill undergraduates', 'Prerequisites vary by course'],
    deadlines: [{ label: 'Listings & Application', date: 'Check McGill Abroad each semester' }],
    notes: 'Courses count toward your degree like any on-campus course.',
    links: [{ label: 'McGill Courses Abroad', url: 'https://www.mcgill.ca/mcgillabroad/' }],
  },
  {
    id: 'internship_arts', type: 'internship',
    title: 'Arts Faculty Internship Program',
    institution: 'Various employers',
    regions: ['americas', 'europe', 'asia_pacific'], country: 'Canada & international',
    duration: '4–8 months', credits: 'Variable (may be credited)', faculties: ['Faculty of Arts'],
    description: 'The Faculty of Arts supports domestic and international internship placements aligned with your studies. Some internships count toward degree credits.',
    eligibility: ['Faculty of Arts students in good standing'],
    deadlines: [{ label: 'Application', date: 'Ongoing – check Arts OASIS' }],
    notes: null,
    links: [{ label: 'Arts Internships & Study Away', url: 'https://www.mcgill.ca/oasis/away' }],
  },
  {
    id: 'internship_engineering', type: 'internship',
    title: 'Engineering Internship & Co-op',
    institution: 'Industry partners',
    regions: ['americas', 'europe', 'asia_pacific'], country: 'Canada & international',
    duration: '12–16 months', credits: 'Credited as part of degree', faculties: ['Faculty of Engineering'],
    description: 'Formal internship and co-op programs including Mining and Materials Engineering co-ops. Professional engineering experience with credits toward your degree.',
    eligibility: ['Faculty of Engineering students in good standing', 'Program-specific requirements apply'],
    deadlines: [{ label: 'Application', date: 'Contact Engineering Student Affairs Office' }],
    notes: 'Mining and Materials Engineering also offer dedicated co-op programs.',
    links: [{ label: 'Engineering Internship Program', url: 'https://www.mcgill.ca/engineering/students/internship' }],
  },
  {
    id: 'internship_aes', type: 'internship',
    title: 'AES Internship Opportunities',
    institution: 'Agriculture / Environment employers',
    regions: ['americas', 'africa_middle', 'asia_pacific'], country: 'Various',
    duration: 'Variable', credits: 'May count toward degree', faculties: ['Faculty of Agricultural and Environmental Sciences'],
    description: 'AES students can pursue placements in agricultural, environmental, and food science sectors, with international options through faculty partnerships.',
    eligibility: ['Faculty of AES students'],
    deadlines: [{ label: 'Application', date: 'Check AES Internship Opportunities page' }],
    notes: null,
    links: [{ label: 'AES Internship Opportunities', url: 'https://www.mcgill.ca/macdonald/students/co-op-and-internship' }],
  },
  {
    id: 'internship_law', type: 'internship',
    title: 'Human Rights Internships – Law',
    institution: 'International Human Rights Organisations',
    regions: ['americas', 'europe', 'africa_middle', 'asia_pacific'], country: 'Various',
    duration: 'Summer (8–12 weeks)', credits: '3 credits', faculties: ['Faculty of Law'],
    description: 'Credited summer internships through CHRLP. Students work with human rights organisations and NGOs internationally.',
    eligibility: ['McGill Law students; competitive application'],
    deadlines: [{ label: 'Application', date: 'Check CHRLP website — typically winter term' }],
    notes: 'Credits count toward BCL/LLB requirements.',
    links: [{ label: 'CHRLP Internships', url: 'https://www.mcgill.ca/humanrights/clinical/internships' }],
  },
  {
    id: 'iut', type: 'iut',
    title: 'Inter-University Transfer (IUT)',
    institution: 'Any Quebec University (BCI network)',
    regions: ['canada'], country: 'Quebec, Canada',
    duration: '1 term', credits: 'Based on courses taken', faculties: null,
    description: "The BCI IUT agreement lets you take courses at any other Quebec university for credit toward your McGill degree at no extra cost. Grades do NOT appear on your transcript or CGPA.",
    eligibility: ['Registered at McGill', 'Course not available at McGill', 'Pre-approval required'],
    deadlines: [{ label: 'Pre-approval', date: 'Before registering at host institution' }, { label: 'Transfer credit', date: 'After completion — submit transcript to Enrolment Services' }],
    notes: 'IUT grades do NOT count toward your McGill CGPA.',
    links: [{ label: 'IUT Information', url: 'https://www.mcgill.ca/oasis/away/iut' }],
  },
  {
    id: 'isa_canada', type: 'iut',
    title: 'Independent Study Away (ISA)',
    institution: 'Accredited Canadian Universities',
    regions: ['canada'], country: 'Canada (outside Quebec)',
    duration: '1 term or summer', credits: 'Variable (pre-approved)', faculties: null,
    description: "Enrol as a visiting student at a Canadian university to earn credits toward your degree. As of Summer 2025, Arts students are limited to Canadian institutions only. Pre-approval is required.",
    eligibility: ['Currently registered McGill student', 'Courses must be pre-approved', 'Language-centre/practicum courses not eligible'],
    deadlines: [{ label: 'Pre-approval', date: 'Before registering — contact Faculty Advising' }],
    notes: 'Host institution tuition may be higher than McGill rates.',
    links: [{ label: 'Study Away – Arts OASIS', url: 'https://www.mcgill.ca/oasis/away/application-process/independent-study-away' }],
  },
  {
    id: 'jexplore', type: 'iut',
    title: "J'Explore Bursary Program",
    institution: 'Canadian Immersion Programs',
    regions: ['canada'], country: 'Canada',
    duration: '3–4 weeks (summer)', credits: 'Non-credit (bursary)', faculties: null,
    description: "Federally-funded bursary covering an intensive French or English immersion program at a Canadian university. Helps meet French language requirements for professional licensure in Quebec.",
    eligibility: ['Canadian citizens or permanent residents', 'Full-time McGill student'],
    deadlines: [{ label: 'Application', date: 'Check McGill Abroad or SOFA annually' }],
    notes: 'Good preparation for the OIIQ French proficiency exam.',
    links: [{ label: "J'Explore Program", url: 'https://www.canada.ca/en/canadian-heritage/services/funding/explore.html' }],
  },
]

// ── Program Card ──────────────────────────────────────────────────────────────

function ProgramCard({ program, saved, onToggleSave }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`sa-card ${open ? 'sa-card--open' : ''}`}>
      <div className="sa-card-header" onClick={() => setOpen(o => !o)}>
        <div className="sa-card-left">
          <span className={`sa-badge sa-badge--${program.type}`}>
            {TYPE_LABELS[program.type]}
          </span>
          <div className="sa-card-info">
            <h3 className="sa-card-title">{program.title}</h3>
            <div className="sa-card-meta">
              <span className="sa-meta"><FaUniversity className="sa-mi" />{program.institution}</span>
              <span className="sa-meta"><FaMapMarkerAlt className="sa-mi" />{program.country}</span>
              <span className="sa-meta"><FaClock className="sa-mi" />{program.duration}</span>
              <span className="sa-meta"><FaGraduationCap className="sa-mi" />{program.credits}</span>
            </div>
          </div>
        </div>
        <div className="sa-card-controls">
          <button
            className={`sa-bm ${saved ? 'sa-bm--on' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleSave(program.id) }}
            title={saved ? 'Remove bookmark' : 'Save'}
          >
            {saved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          <span className="sa-chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
      </div>

      {open && (
        <div className="sa-card-body">
          <p className="sa-desc">{program.description}</p>
          <div className="sa-body-grid">
            {program.eligibility?.length > 0 && (
              <div className="sa-section">
                <h4 className="sa-section-title"><FaUsers /> Eligibility</h4>
                <ul className="sa-list-items">
                  {program.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            {program.deadlines?.length > 0 && (
              <div className="sa-section">
                <h4 className="sa-section-title"><FaClock /> Deadlines</h4>
                {program.deadlines.map((d, i) => (
                  <div key={i} className="sa-dl-row">
                    <span className="sa-dl-label">{d.label}</span>
                    <span className="sa-dl-date">{d.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {program.notes && (
            <div className="sa-note"><FaInfoCircle className="sa-note-icon" /><span>{program.notes}</span></div>
          )}
          <div className="sa-links">
            {program.links?.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="sa-link">
                {l.label} <FaExternalLinkAlt />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StudyAbroadView({ profile = {} }) {
  const [view,         setView]         = useState('browse')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [search,       setSearch]       = useState('')
  const [savedIds,     setSavedIds]     = useState(new Set())

  const toggleSave = id => setSavedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const browsed = useMemo(() => PROGRAMS.filter(p => {
    if (typeFilter   !== 'all' && p.type !== typeFilter) return false
    if (regionFilter !== 'all' && !p.regions.includes(regionFilter)) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return p.title.toLowerCase().includes(q) ||
             p.institution.toLowerCase().includes(q) ||
             p.country.toLowerCase().includes(q) ||
             p.description.toLowerCase().includes(q)
    }
    return true
  }), [typeFilter, regionFilter, search])

  const savedPrograms = useMemo(() => PROGRAMS.filter(p => savedIds.has(p.id)), [savedIds])
  const hasFilters = typeFilter !== 'all' || regionFilter !== 'all' || search.trim()

  return (
    <div className="sa-view">

      {/* Header */}
      <div className="sa-header">
        <div className="sa-header-icon"><FaGlobe /></div>
        <div>
          <h2 className="sa-title">Study Abroad & Field Studies</h2>
          <p className="sa-sub">Exchanges, field semesters, internships, and study away — credits count toward your McGill degree.</p>
        </div>
      </div>

      {/* Top-level view tabs */}
      <div className="sa-tabs">
        <button
          className={`sa-tab ${view === 'browse' ? 'sa-tab--active' : ''}`}
          onClick={() => setView('browse')}
        >
          Browse <span className="sa-tab-pill">{PROGRAMS.length}</span>
        </button>
        <button
          className={`sa-tab ${view === 'saved' ? 'sa-tab--active' : ''}`}
          onClick={() => setView('saved')}
        >
          Saved {savedIds.size > 0 && <span className="sa-tab-pill sa-tab-pill--accent">{savedIds.size}</span>}
        </button>
      </div>

      {view === 'browse' && (
        <>
          {/* Stats strip */}
          <div className="sa-stats">
            <span><b>150+</b> partner universities</span>
            <span className="sa-stats-dot">·</span>
            <span><b>39</b> countries</span>
            <span className="sa-stats-dot">·</span>
            <span><b>5</b> program types</span>
          </div>

          {/* Search */}
          <div className="sa-search-row">
            <FaSearch className="sa-search-ico" />
            <input
              className="sa-search"
              placeholder="Search programs, destinations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="sa-search-x" onClick={() => setSearch('')}>×</button>}
          </div>

          {/* Type pills */}
          <div className="sa-pill-row">
            {PROGRAM_TYPES.map(t => (
              <button
                key={t.id}
                className={`sa-pill ${typeFilter === t.id ? 'sa-pill--on' : ''}`}
                onClick={() => setTypeFilter(t.id)}
              >{t.label}</button>
            ))}
          </div>

          {/* Region pills */}
          <div className="sa-pill-row sa-pill-row--sm">
            {REGIONS.map(r => (
              <button
                key={r.id}
                className={`sa-pill sa-pill--sm ${regionFilter === r.id ? 'sa-pill--on' : ''}`}
                onClick={() => setRegionFilter(r.id)}
              >{r.label}</button>
            ))}
          </div>

          {/* Results count */}
          <div className="sa-result-bar">
            <span className="sa-result-count">
              {browsed.length} program{browsed.length !== 1 ? 's' : ''}{hasFilters ? ' matching filters' : ''}
            </span>
            {hasFilters && (
              <button className="sa-clear-btn"
                onClick={() => { setTypeFilter('all'); setRegionFilter('all'); setSearch('') }}
              >Clear filters</button>
            )}
          </div>

          {/* Program list */}
          {browsed.length === 0
            ? <div className="sa-empty"><FaPlane className="sa-empty-ico" /><p>No programs match your filters.</p></div>
            : <div className="sa-cards">{browsed.map(p =>
                <ProgramCard key={p.id} program={p} saved={savedIds.has(p.id)} onToggleSave={toggleSave} />
              )}</div>
          }
        </>
      )}

      {view === 'saved' && (
        <div className="sa-cards">
          {savedPrograms.length === 0
            ? (
              <div className="sa-empty">
                <FaRegBookmark className="sa-empty-ico" />
                <p>No saved programs yet.</p>
                <p className="sa-empty-sub">Browse programs and click <FaRegBookmark style={{verticalAlign:'middle'}} /> to save them here.</p>
              </div>
            )
            : savedPrograms.map(p =>
                <ProgramCard key={p.id} program={p} saved={true} onToggleSave={toggleSave} />
              )
          }
        </div>
      )}

      {/* Footer */}
      <div className="sa-footer">
        <span>Looking for something not listed here?</span>
        <a href="https://www.mcgill.ca/mcgillabroad/go-abroad" target="_blank" rel="noopener noreferrer" className="sa-footer-link">
          Visit McGill Abroad <FaExternalLinkAlt />
        </a>
      </div>

    </div>
  )
}
