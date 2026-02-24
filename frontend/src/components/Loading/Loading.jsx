import loadingVideo from '../../assets/loading-bg.mp4'
import './Loading.css'

export default function Loading() {
  return (
    <div className="loading-container">
      <video
        className="loading-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={loadingVideo} type="video/mp4" />
      </video>
      <div className="loading-overlay" />
      <div className="loading-content">
        <p className="loading-message">Loading</p>
      </div>
    </div>
  )
}
