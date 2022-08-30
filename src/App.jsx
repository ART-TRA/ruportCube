import React, { useEffect, useRef, useState } from 'react'
import { Scene } from './components/Scene'
import { FrontLayout } from './components/FrontLayout';

const faces = ['front', 'top', 'back', 'bottom']
let i = 0

export const App = () => {
  const [isVideoVisible, setVideoVisible] = useState(false)
  const [isLayoutVisible, setLayoutVisible] = useState(true)
  const [isSceneHovered, setSceneHovered] = useState(false)

  const setHovered = (value) => {
    setTimeout(() => {
      setSceneHovered(value)
    }, 1000)
  }

  //-----------------------------------------------------------------------------------
  const [playAnimation, setPlayAnimation] = useState('first')
  const setClick = () => {
    setPlayAnimation(!playAnimation)
  }
  //-----------------------------------------------------------------------------------
  
  return (
    <>
      {/*<Audio/>*/}
      {/*<VideoLayer isVideoVisible={isVideoVisible}/>*/}
      {/*<FrontLayout isLayoutVisible={isLayoutVisible} />*/}
      <div
        className="scene"
        onMouseLeave={() => setHovered(false)}
        onMouseOver={() => setHovered(true)}
      >
        <Scene 
          setVideoVisible={setVideoVisible} 
          playAnimation={playAnimation}
          isSceneHovered={isSceneHovered}
        />
      </div>
    </>
  );
}

