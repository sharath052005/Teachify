import '../styles/videoplayer.css'

export default function VideoPlayer({ youtubeId, title }) {
  if (!youtubeId) return (
    <div className="video-placeholder">
      <div className="video-placeholder__icon">▶</div>
      <p>No video available</p>
    </div>
  )

  return (
    <div className="video-wrapper">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=0`}
        title={title || 'Course Video'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="video-iframe"
      />
    </div>
  )
}