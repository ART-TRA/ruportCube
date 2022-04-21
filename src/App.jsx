import React, { useState } from 'react'
import { Scene } from './components/Scene'

export const App = () => {
  const [isVideoVisible, setVideoVisible] = useState(false)
  return (
    <>
      {/*<Audio/>*/}
      {/*<VideoLayer isVideoVisible={isVideoVisible}/>*/}
      <div className="scene">
        <Scene setVideoVisible={setVideoVisible}/>
      </div>
    </>
  );
}

