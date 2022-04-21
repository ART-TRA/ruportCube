import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import classNames from 'classnames'

import audio1 from './audio/Billy.mp3'

const scaler = {
  length: 5,
  width: 1,
  height: 1
}
let scrollX = {value: 0};
let currentSide = 'front'
const rotationDelay = 300

const scrollCheckPoints = {
  front: {radian: 0.0, scroll: 0.0},
  top: {radian: Math.PI * 0.5, scroll: 987.5},
  back: {radian: Math.PI, scroll: 1975},
  bottom: {radian: Math.PI * 1.5, scroll: 2955},
}

const Box = ({setVideoVisible}) => {
  const timeline = gsap.timeline()
  const elapsedTimeSide = useRef(0)
  const backTexture = useRef()
  const frontTexture = useRef()
  const topTexture = useRef()
  const bottomTexture = useRef()

  const lockMouseOffset = useRef(false)
  const prevElapsedTimeValue = useRef(0)
  const scrollToCheckpoint = useRef({
    front: false,
    top: false,
    back: false,
    bottom: false
  })
  const frontRef = useRef()
  const scroll = useRef(0);
  const isNear = useRef()
  let mouse = new THREE.Vector2(0, 0)
  const boxGroupRef = useRef()
  const facesPositions = useRef({
    front: {
      sizes: [scaler.length, scaler.height],
      position: [0, 0, scaler.width / 2],
      rotation: []
    },
    top: {
      sizes: [scaler.length, scaler.width],
      position: [0, scaler.height / 2, 0],
      rotation: [-Math.PI / 2, 0, 0]
    },
    bottom: {
      sizes: [scaler.length, scaler.width],
      position: [0, -scaler.height / 2, 0],
      rotation: [Math.PI / 2, 0, 0]
    },
    back: {
      sizes: [scaler.length, scaler.height],
      position: [0, 0, -scaler.width / 2],
      rotation: [0, Math.PI, 0]
    },
    left: {
      sizes: [scaler.width, scaler.height],
      position: [-scaler.length / 2, 0, 0],
      rotation: [0, -Math.PI / 2, 0]
    },
    right: {
      sizes: [scaler.width, scaler.height],
      position: [scaler.length / 2, 0, 0],
      rotation: [0, Math.PI / 2, 0]
    },
  })
  const [video] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: 'video/Billy.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true,
    }),
  )
  const [video2] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: 'video/Billy2.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true,
    }),
  )
  const [video3] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: 'video/RicardoVert.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true,
    }),
  )
  const [video4] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: 'video/Gorillaz.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true,
    }),
  )
  useEffect(() => {
    video.play()
    video2.play()
    video3.play()
    video4.play()

  }, [video, video2, video3, video4])

  const wrapTexture = (texture) => {
    //todo для ресайза aspect видео

    // texture.current.repeat.x = 1
    gsap.to(texture.current.repeat, {
      duration: 1,
      x: 1,
      y: !isNear.current ? 1 : 0.4,
      ease: 'power3'
    })
    // texture.current.repeat.y = !isNear.current ? 1 : 0.4
  }

  const handleFaceClick = (face, event) => {
    lockMouseOffset.current = !lockMouseOffset.current
    console.log('click', face, scroll.current)

    //доскролл при нажатиии на грань
    switch (face) {
      case 'front':
        video.muted = isNear.current
        scrollToCheckpoint.current.front = true
        wrapTexture(frontTexture)
        break
      case 'top':
        video2.muted = isNear.current
        scrollToCheckpoint.current.top = true
        wrapTexture(topTexture)
        break
      case 'back':
        video3.muted = isNear.current
        scrollToCheckpoint.current.back = true
        wrapTexture(backTexture)
        break
      case 'bottom':
        video4.muted = isNear.current
        scrollToCheckpoint.current.bottom = true
        wrapTexture(bottomTexture)
        break
    }

    frontRef.current = event.object
    isNear.current = !isNear.current

  }

  const handleScroll = () => {
    if (!isNear.current) {
      scrollX.value = window.scrollY / (2955 - window.innerHeight)
      boxGroupRef.current.rotation.set(Math.PI * scrollX.value, 0, 0)
      scroll.current = Math.PI * scrollX.value
    }
  };

  const mouseMove = (event) => {
    mouse = {
      x: event.clientX / window.innerWidth * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    }
  }

  const rotateToCheckPoint = (scroll, position) => {
    if (currentSide !== position) {
      elapsedTimeSide.current = 0
    }
    // console.log(position)
    // console.log(elapsedTimeSide.current)
    currentSide = position
    if (elapsedTimeSide.current === rotationDelay) {
      scrollX.value = scroll / (2955 - window.innerHeight)
      gsap.to(boxGroupRef.current.rotation, {
        duration: 1,
        x: Math.PI * scrollX.value,
        ease: 'power3'
      })
      // elapsedTimeSide.current = 0
    }
    if (elapsedTimeSide.current > rotationDelay) {
      window.scrollTo(0, scrollCheckPoints[position].scroll)
      elapsedTimeSide.current = 0
    }
  }

  useLayoutEffect(() => {
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  const setTextureWrapping = (texture) => {
    //todo для ресайза aspect видео
    texture.current.wrapT = texture.current.wrapS = THREE.ClampToEdgeWrapping
    texture.current.repeat.x = 1
    texture.current.repeat.y = 0.25
  }
  useEffect(() => {
    if (frontTexture.current) {
      setTextureWrapping(frontTexture)
    }
    if (topTexture.current) {
      setTextureWrapping(topTexture)
    }
    if (backTexture.current) {
      setTextureWrapping(backTexture)
      //todo неск-ко wrap-ов не работают вместе или я не въезжаю ещё
      // backTexture.current.wrapT = THREE.RepeatWrapping
      // backTexture.current.repeat.y = -1
    }
    if (bottomTexture.current) {
      setTextureWrapping(bottomTexture)
    }
  }, [frontTexture.current, topTexture.current])

  useFrame(({camera, scene, clock}) => {
    if (!lockMouseOffset.current && !isNear.current) {
      // console.log('notLock')
      camera.position.x += (-mouse.x - camera.position.x) * .9;
      camera.position.y += (-mouse.y - camera.position.y);
      camera.lookAt(scene.position);
    } else {
      // console.log('lock')
      camera.position.x = 0
      camera.position.y = 0
      camera.lookAt(scene.position);
    }

    // if (camera.position.z === 1) {
    // 	setVideoVisible(true)
    // } else {
    // 	setVideoVisible(false)
    // }

    ['front', 'top', 'back', 'bottom'].forEach(item => {
      if (scrollToCheckpoint.current[item]) {
        console.log('II', item)
        window.scrollTo(0, scrollCheckPoints[item].scroll)
        scrollX.value = window.scrollY / (2955 - window.innerHeight)
        timeline.add('faceClick')
          .to(frontRef.current.scale, {
            duration: 1,
            x: isNear.current ? 0.4 : 1,
            ease: 'power3'
          }, 'faceClick')
          .to(boxGroupRef.current.rotation, {
            duration: 1,
            x: Math.PI * scrollX.value,
            ease: 'power3'
          }, 'faceClick')
          .to(camera.position, {
            duration: 1,
            x: 0,
            y: 0,
            z: isNear.current ? 1 : 2.4,
            ease: 'power3'
          }, 'faceClick')

        scrollToCheckpoint.current[item] = false
      }
    })

    //поворот задней текстуры
    // backTexture.current.wrapT = THREE.RepeatWrapping
    // backTexture.current.repeat.y = -1

    //докрутка до контрольной точки
    if (window.scrollY <= 987.5 / 2) {
      elapsedTimeSide.current++
      rotateToCheckPoint(0.0, 'front')
    } else if (window.scrollY >= 987.5 / 2 && window.scrollY <= (1975 - 493.75)) {
      elapsedTimeSide.current++
      rotateToCheckPoint(987.5, 'top')
    } else if (window.scrollY >= (1975 - 493.75) && window.scrollY <= (2955 - 493.75)) {
      elapsedTimeSide.current++
      rotateToCheckPoint(1975, 'back')
    } else {
      elapsedTimeSide.current++
      rotateToCheckPoint(2955, 'bottom')
    }
  })


  return (
    <group ref={boxGroupRef}>
      <mesh
        ref={frontRef}
        onClick={(event) => handleFaceClick('front', event)}
        position={facesPositions.current.front.position}
      >
        <planeBufferGeometry args={facesPositions.current.front.sizes}/>
        <meshBasicMaterial toneMapped={false}>
          <videoTexture ref={frontTexture} attach="map" args={[video]} encoding={THREE.sRGBEncoding}/>
        </meshBasicMaterial>
      </mesh>
      <mesh
        onClick={(event) => handleFaceClick('right', event)}
        rotation={facesPositions.current.right.rotation}
        position={facesPositions.current.right.position}
      >
        <planeBufferGeometry args={facesPositions.current.right.sizes}/>
        <meshBasicMaterial color={'#00ffff'}/>
      </mesh>
      <mesh
        onClick={(event) => handleFaceClick('left', event)}
        position={facesPositions.current.left.position}
        rotation={facesPositions.current.left.rotation}
      >
        <planeBufferGeometry args={facesPositions.current.left.sizes}/>
        <meshBasicMaterial color={'#ff0000'}/>
      </mesh>
      <mesh
        onClick={(event) => handleFaceClick('back', event)}
        position={facesPositions.current.back.position}
        rotation={facesPositions.current.back.rotation}
      >
        <planeBufferGeometry args={facesPositions.current.back.sizes}/>
        <meshBasicMaterial>
          <videoTexture ref={backTexture} attach="map" args={[video3]} encoding={THREE.sRGBEncoding}/>
        </meshBasicMaterial>
      </mesh>
      <mesh
        onClick={(event) => handleFaceClick('top', event)}
        position={facesPositions.current.top.position}
        rotation={facesPositions.current.top.rotation}
      >
        <planeBufferGeometry args={facesPositions.current.top.sizes}/>
        <meshBasicMaterial color={'#ffffff'}>
          <videoTexture ref={topTexture} attach="map" args={[video2]} encoding={THREE.sRGBEncoding}/>
        </meshBasicMaterial>
      </mesh>
      <mesh
        onClick={(event) => handleFaceClick('bottom', event)}
        position={facesPositions.current.bottom.position}
        rotation={facesPositions.current.bottom.rotation}
      >
        <planeBufferGeometry args={facesPositions.current.bottom.sizes}/>
        <meshBasicMaterial>
          <videoTexture ref={bottomTexture} attach="map" args={[video4]} encoding={THREE.sRGBEncoding}/>
        </meshBasicMaterial>
      </mesh>
    </group>
  )
}

//TEST
//---------------------------------------------------------------------------------
const textureParams = {
  width: 1280,
  height: 720,
}

const TestTexture = () => {
  const timeline = gsap.timeline()
  const mainRef = useRef()
  const textureRef = useRef()
  const textureAspectRatio = useRef(720/1280)
  const [isLarge, setLarge] = useState(false)

  const [video] = useState(() =>
    Object.assign(document.createElement('video'), {
      // src: 'video/Ricardo.mp4',
      src: 'video/Gorillaz.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true,
    }),
  )

  const handleTextureClick = (event) => {
    setLarge(!isLarge)
  }

  useEffect(() => {
    timeline.add('faceClick')
      .to(mainRef.current.scale, {
        duration: 1,
        // x: isLarge ? 1.2 : 1,
        y: isLarge ? 4 : 1,
        ease: 'power3'
      }, 'faceClick')
      .to(textureRef.current.repeat, {
        duration: 1,
        x: isLarge ? 1 : 1,
        y: isLarge ? 0.8 : 0.2,
        ease: 'power3'
      }, 'faceClick')
      .to(textureRef.current.offset, {
        duration: 1,
        y: isLarge ? 0 : 0.5,
        ease: 'power3'
      }, 'faceClick')
  }, [isLarge])

  useEffect(() => {
    video.play()
    console.log(textureRef.current)
    textureRef.current.wrapS = THREE.ClampToEdgeWrapping
    textureRef.current.wrapT = THREE.ClampToEdgeWrapping
    textureRef.current.repeat.y = 0.2
    textureRef.current.repeat.x = 1
    textureRef.current.offset.y = 0.5
  }, [video])

  return (
    <mesh
      ref={mainRef}
      onClick={handleTextureClick}
    >
      <planeBufferGeometry args={[8, 1]}/>
      <meshBasicMaterial toneMapped={false}>
        <videoTexture ref={textureRef} attach="map" args={[video]} encoding={THREE.sRGBEncoding}/>
      </meshBasicMaterial>
    </mesh>
  )
}

//---------------------------------------------------------------------------------


const Scene = ({setVideoVisible}) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{fov: 90, position: [0, 0, 2.4], near: 0.1, far: 1000}}
    >
      <ambientLight intensity={0.5}/>
      <color attach="background" args={['#202020']}/>
      <Suspense fallback={null}>
        <TestTexture/>
        {/*<Box setVideoVisible={setVideoVisible}/>*/}
      </Suspense>
    </Canvas>
  )
}

const VideoLayer = ({isVideoVisible}) => {
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

const Audio = () => {
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

export const App = () => {
  const [isVideoVisible, setVideoVisible] = useState(false)
  return (
    <>
      {/*<VideoLayer isVideoVisible={isVideoVisible}/>*/}
      <div className="scene">
        <Scene setVideoVisible={setVideoVisible}/>
      </div>
    </>
  );
}

