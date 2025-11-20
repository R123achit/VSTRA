import { useState, useRef, useEffect } from 'react'

export default function VideoDebug() {
  const [status, setStatus] = useState('Loading...')
  const [videoInfo, setVideoInfo] = useState({})
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setStatus('Loading video...')
    const handleLoadedData = () => {
      setStatus('✅ Video loaded successfully!')
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        currentSrc: video.currentSrc
      })
    }
    const handleError = (e) => {
      setStatus('❌ Video failed to load')
      console.error('Video error:', e)
    }
    const handleCanPlay = () => setStatus('Video ready to play')

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Video Debug Info</h3>
      <p className="mb-2">Status: {status}</p>
      {videoInfo.currentSrc && (
        <div className="space-y-1">
          <p>Duration: {videoInfo.duration?.toFixed(2)}s</p>
          <p>Size: {videoInfo.width}x{videoInfo.height}</p>
          <p className="break-all">Source: {videoInfo.currentSrc?.substring(0, 50)}...</p>
        </div>
      )}
      
      <div className="mt-4 border-t border-gray-700 pt-2">
        <p className="font-semibold mb-2">Test Video:</p>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          className="w-full h-20 object-cover rounded"
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
