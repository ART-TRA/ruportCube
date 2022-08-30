import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
import * as THREE from 'three'
import { Cube } from './Cube'

export const Scene = ({setVideoVisible, currentFace, playAnimation, isSceneHovered}) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{fov: 50, position: [0, 0, 4], near: 0.1, far: 1000}}
    >
      <ambientLight intensity={0.5}/>
      <color attach="background" args={['#858585']}/>
      <Suspense fallback={null}>
        <Cube
          setVideoVisible={setVideoVisible}
          currentEdge={currentFace}
          isSceneHovered={isSceneHovered}
        />
      </Suspense>
    </Canvas>
  )
}