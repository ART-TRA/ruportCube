import classNames from 'classnames'
import React from 'react'

export const VideoLayer = ({isVideoVisible}) => {
  console.log('IS', isVideoVisible)
  const videoClassNames = classNames('video', {
    video__visible: isVideoVisible
  })
  return (
    <div className={videoClassNames}>
      <video
        autoPlay
        loop
        muted
      >
        <source src="video/Billy.mp4" type="video/mp4"/>
      </video>
    </div>
  )
}