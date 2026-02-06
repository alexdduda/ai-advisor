import { useState } from 'react'
import './Forum.css'

export default function Forum() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleWaitlist = (e) => {
    e.preventDefault()
    // TODO: Hook up to backend waitlist endpoint
    console.log('Waitlist signup:', email)
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 3000)
  }

  const features = [
    {
      icon: '💬',
      title: 'Ask Questions',
      description: 'Get help from fellow McGill students on courses, professors, and academics'
    },
    {
      icon: '👥',
      title: 'Connect with Classmates',
      description: 'Find study groups, share notes, and collaborate on projects'
    },
    {
      icon: '📝',
      title: 'Share Experiences',
      description: 'Review courses, rate professors, and help others make informed decisions'
    },
    {
      icon: '🎯',
      title: 'Course Planning',
      description: 'Discuss degree requirements, prerequisites, and academic pathways'
    }
  ]

  const mockPosts = [
    {
      author: 'Alex M.',
      time: '2 hours ago',
      title: 'Anyone taken COMP 251 with Prof. Blanchette?',
      preview: "I'm deciding between sections for next semester. How's the workload?",
      replies: 12,
      likes: 8
    },
    {
      author: 'Sarah K.',
      time: '5 hours ago',
      title: 'Study group for MATH 240?',
      preview: 'Looking to form a study group for the midterm. DM if interested!',
      replies: 7,
      likes: 15
    }
  ]

  return (
    <div className="forum-container">
      {/* Hero Section */}
      <div className="forum-hero">
        <div className="forum-hero-content">
          <span className="coming-soon-badge">Coming Soon</span>
          <h1 className="forum-title">McGill Community Forum</h1>
          <p className="forum-subtitle">
            Connect with fellow students, share experiences, and get advice from the McGill community
          </p>
          
          {!subscribed ? (
            <form className="waitlist-form" onSubmit={handleWaitlist}>
              <input
                type="email"
                className="waitlist-input"
                placeholder="Enter your email to join the waitlist"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="waitlist-btn">
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="waitlist-success">
              ✅ You're on the list! We'll notify you when the forum launches.
            </div>
          )}
          
          <p className="launch-date">Launching Spring 2026</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="forum-features">
        <h2 className="features-title">What's Coming</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="forum-preview">
        <h2 className="preview-title">Sneak Peek</h2>
        <p className="preview-subtitle">Here's what the forum will look like</p>
        
        <div className="mock-forum">
          <div className="mock-header">
            <h3>Recent Discussions</h3>
            <button className="mock-btn" disabled>+ New Post</button>
          </div>
          
          <div className="mock-posts">
            {mockPosts.map((post, idx) => (
              <div key={idx} className="mock-post">
                <div className="mock-post-header">
                  <div className="mock-avatar">{post.author[0]}</div>
                  <div className="mock-post-meta">
                    <span className="mock-author">{post.author}</span>
                    <span className="mock-time">{post.time}</span>
                  </div>
                </div>
                <h4 className="mock-post-title">{post.title}</h4>
                <p className="mock-post-preview">{post.preview}</p>
                <div className="mock-post-stats">
                  <span>💬 {post.replies} replies</span>
                  <span>❤️ {post.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mock-overlay">
            <div className="mock-overlay-content">
              <span className="mock-overlay-icon">🔒</span>
              <p>Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="forum-cta">
        <h2>Be Among the First</h2>
        <p>Join the waitlist to get early access and help shape the community</p>
        {!subscribed && (
          <button className="cta-btn" onClick={() => document.querySelector('.waitlist-input')?.focus()}>
            Join Waitlist
          </button>
        )}
      </div>
    </div>
  )
}

