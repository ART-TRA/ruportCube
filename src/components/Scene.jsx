import { Canvas } from '@react-three/fiber'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Cube } from './Cube'
import * as THREE from 'three'
import gsap from "gsap"

const Test = () => {
  const timeline = gsap.timeline()
  const mainRef = useRef()
  const textureRef = useRef()
  const [isNear, setNear] = useState(false)

  const [video] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: 'video/Ricardo.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true,
    }),
  )

  const faceClick = () => {
    setNear(!isNear)
  }

  useEffect(() => {
    timeline.add('faceClick')
      .to(textureRef.current.repeat, {
        duration: 1,
        y: isNear ? 0.98 : 0.2,
        x: isNear ? 1 : 0.91,
        ease: 'power3'
      }, 'faceClick')
      .to(textureRef.current.offset, {
        duration: 1,
        y: isNear ? 0 : 0.39,
        x: isNear ? 0 : 0.045,
        ease: 'power3'
      }, 'faceClick')
      .to(mainRef.current.scale, {
        duration: 1,
        y: isNear ? 5 : 1,
        x: isNear ? 1.11 : 1,
        ease: 'power3'
      }, 'faceClick')
  }, [isNear])

  useEffect(() => {
    video.play()
    console.log('TT', textureRef.current)
    textureRef.current.wrapS = textureRef.current.wrapT = THREE.ClampToEdgeWrapping
  }, [video])

  return (
    <mesh
      ref={mainRef}
      onClick={faceClick}
    >
      <planeBufferGeometry args={[8, 1]}/>
      <meshBasicMaterial>
        <videoTexture
          ref={textureRef}
          attach="map"
          args={[video]}
          encoding={THREE.sRGBEncoding}
        />
      </meshBasicMaterial>
    </mesh>
  )
}

export const Scene = ({setVideoVisible}) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{fov: 90, position: [0, 0, 2.4], near: 0.1, far: 1000}}
    >
      <ambientLight intensity={0.5}/>
      <color attach="background" args={['#202020']}/>
      <Suspense fallback={null}>
        {/*<Cube setVideoVisible={setVideoVisible}/>*/}
        <Test/>
      </Suspense>
    </Canvas>
  )
}