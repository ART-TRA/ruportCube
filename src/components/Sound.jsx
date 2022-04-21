import React, { useEffect, useRef } from 'react'
import audio1 from '../audio/Billy.mp3'

export const Audio = () => {
  const audio = useRef()

  useEffect(() => {
    if (audio.current) {
      console.log('UUU')
      audio.current.play()
      if (audio.current.paused) {

      } else {
        // audio.current.pause()
      }

    }
  }, [audio.current])

  return (
    <audio
      // onTimeUpdate={updateTime}
      // onCanPlay={onCanPlay}
      // onEnded={onEnded}
      ref={audio}
      preload="true"
      autoPlay={true}
      src={audio1}
    />
  )
}