import gsap from "gsap"
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { log } from 'three/examples/jsm/renderers/nodes/ShaderNode'

//CONSTANTS
//------------------------------------------------------------------------------
const scaler = {
  length: 6,
  width: 1,
  height: 1
}
let scrollX = {value: 0};
let currentSide = 'front'
const rotationDelay = 300
const duration = 1

const scrollCheckPoints = {
  front: {radian: 0.0, scroll: 0.0},
  top: {radian: Math.PI * 0.5, scroll: 987.5},
  back: {radian: Math.PI, scroll: 1975},
  bottom: {radian: Math.PI * 1.5, scroll: 2955},
}

//------------------------------------------------------------------------------


export const Cube = ({setVideoVisible}) => {
  const timeline = gsap.timeline()
  const clickTimeline = gsap.timeline()
  const elapsedTimeSide = useRef(0)
  const backTexture = useRef()
  const frontTexture = useRef()
  const topTexture = useRef()
  const bottomTexture = useRef()
  const {camera, scene} = useThree()

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
  const [isNear, setNear] = useState()
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
      src: 'video/Gorillaz.mp4',
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
      src: 'video/Billy.mp4',
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

    frontTexture.current.wrapS = frontTexture.current.wrapT = THREE.ClampToEdgeWrapping
    topTexture.current.wrapS = topTexture.current.wrapT = THREE.ClampToEdgeWrapping
    backTexture.current.wrapS = backTexture.current.wrapT = THREE.ClampToEdgeWrapping
    bottomTexture.current.wrapS = bottomTexture.current.wrapT = THREE.ClampToEdgeWrapping

  }, [video, video2, video3, video4])

  const setTextureWrapping = (texture) => {
    // texture.current.wrapT = texture.current.wrapS = THREE.ClampToEdgeWrapping
    // texture.current.offset.y = 0.5
    // texture.current.repeat.x = 1
    // texture.current.repeat.y = 0.25
  }
  const currentFace = useRef('all')

  const wrapTextureInner = (texture) => {
    window.scrollTo(0, scrollCheckPoints[currentFace.current]?.scroll)
    scrollX.value = window.scrollY / (2955 - window.innerHeight)

    console.log('CC', currentFace.current)
    clickTimeline.add('resize')
      .to(texture.current.repeat, {
        duration: 1,
        y: isNear ? 0.98 : 0.2,
        x: isNear ? 1 : 0.91,
        ease: 'power3'
      }, 'resize')
      .to(texture.current.offset, {
        duration: 1,
        y: isNear ? 0 : 0.39,
        x: isNear ? 0 : 0.045,
        ease: 'power3'
      }, 'resize')
      .to(frontRef.current.scale, {
        duration: 1,
        y: isNear ? 5 : 1,
        x: isNear ? 1.11 : 1,
        ease: 'power3'
      }, 'resize')
      .to(boxGroupRef.current.rotation, {
        duration: duration,
        x: Math.PI * scrollX.value,
        ease: 'power3'
      }, 'resize')
  }

  const firstWrap = (texture) => {
    texture.current.repeat.set(0.91, 0.2, 0)
    texture.current.offset.set(0.045, 0.39, 0)
  }

  const wrapTexture = () => {
    console.log('vol0')
    if (currentFace.current === 'front') {
      console.log('vol1', 'front')
      video.muted = !isNear
      wrapTextureInner(frontTexture)
    }
    if (currentFace.current === 'top') {
      console.log('vol2', 'top')
      video2.muted = !isNear
      wrapTextureInner(topTexture)
    }
    if (currentFace.current === 'back') {
      console.log('vol3', 'back')
      video3.muted = !isNear
      wrapTextureInner(backTexture)
    }
    if (currentFace.current === 'bottom') {
      console.log('vol4', 'bottom')
      video4.muted = !isNear
      wrapTextureInner(bottomTexture)
    }
    if (currentFace.current === 'all' && frontTexture.current) {
      console.log('vol5', frontTexture.current)
      firstWrap(frontTexture)
      firstWrap(topTexture)
      firstWrap(backTexture)
      firstWrap(bottomTexture)
    }
  }


  const handleFaceClick = (face, event) => {
    lockMouseOffset.current = !lockMouseOffset.current
    currentFace.current = face
    setNear(!isNear)

    //доскролл при нажатиии на грань
    // switch (face) {
    //   case 'front':
    //     // video.muted = isNear
    //     scrollToCheckpoint.current.front = true
    //     wrapTexture(frontTexture)
    //     console.log('vol2', frontTexture.current.offset)
    //     break
    //   case 'top':
    //     // video2.muted = isNear
    //     scrollToCheckpoint.current.top = true
    //     wrapTexture(topTexture)
    //     break
    //   case 'back':
    //     // video3.muted = isNear
    //     scrollToCheckpoint.current.back = true
    //     wrapTexture(backTexture)
    //     break
    //   case 'bottom':
    //     // video4.muted = isNear
    //     scrollToCheckpoint.current.bottom = true
    //     wrapTexture(bottomTexture)
    //     break
    // }

    frontRef.current = event.object
  }

  useEffect(() => {
    scrollToCheckpoint.current[currentFace.current] = true
    wrapTexture()
  }, [isNear])

  const handleScroll = () => {
    if (!isNear) {
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

    if (!lockMouseOffset.current && !isNear) {
      camera.position.x += (-mouse.x - camera.position.x) * .9;
      camera.position.y += (-mouse.y - camera.position.y);
      camera.lookAt(scene.position);
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
        duration: duration,
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

  useFrame(({camera, scene, clock}) => {
    ['front', 'top', 'back', 'bottom'].forEach(item => {
      if (scrollToCheckpoint.current[item]) {
        // console.log('II', item)
        // window.scrollTo(0, scrollCheckPoints[item].scroll)
        // scrollX.value = window.scrollY / (2955 - window.innerHeight)
        // timeline.add('faceClick')
          // .to(frontRef.current.scale, {
          //   duration: duration,
          //   x: isNear ? 0.4 : 1,
          //   ease: 'power3'
          // }, 'faceClick')
          // .to(boxGroupRef.current.rotation, {
          //   duration: duration,
          //   x: Math.PI * scrollX.value,
          //   ease: 'power3'
          // }, 'faceClick')
          // .to(camera.position, {
          //   duration: duration,
          //   x: 0,
          //   y: 0,
          //   z: isNear ? 1 : 2.4,
          //   ease: 'power3'
          // }, 'faceClick')

        // scrollToCheckpoint.current[item] = false
      }
    })

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