import gsap from 'gsap'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { isTablet, isMobile } from './../utilities/resize';

//CONSTANTS
//------------------------------------------------------------------------------
let scrollX = {value: 0};
let currentSide = 'front'
const rotationDelay = 60
const duration = 1

//общая высота скролла
const scrollHeight = document.getElementById('root').scrollHeight
//текущее значение скролла куба
const currentScroll = (window.scrollY * 1.5) / (scrollHeight - window.innerHeight)

const scrollCheckPoints = {
	front: {radian: 0.0, scroll: 0.0},
	bottom: {radian: -Math.PI * 0.5, scroll: scrollHeight * 0.25},
	back: {radian: -Math.PI, scroll: scrollHeight * 0.5},
	top: {radian: -Math.PI * 1.5, scroll: scrollHeight * 0.75},
}

//------------------------------------------------------------------------------

let mouse = new THREE.Vector2(0, 0)
let isLockMove = false

export const Cube = ({setVideoVisible, isSceneHovered}) => {
	const clickTimeline = gsap.timeline()
	const clickTimelineFirst = gsap.timeline()
	const elapsedTimeSide = useRef(0)
	const backTexture = useRef()
	const frontTexture = useRef()
	const topTexture = useRef()
	const bottomTexture = useRef()
	const {camera, scene, viewport} = useThree()
	const state = useThree()
	const [geometryArgs, setGeometryArgs] = useState([]);
	const [facesPositions, setFacesPositions] = useState({});
	const faceMaterialFront = useRef()
	const faceMaterialTop = useRef()
	const faceMaterialBack = useRef()
	const faceMaterialBottom = useRef()

	const [currentEdge, setCurrentEdge] = useState('front')

	const lockMouseOffset = useRef(false)
	const scrollToCheckpoint = useRef({
		front: false,
		top: false,
		back: false,
		bottom: false
	})
	const frontRef = useRef()
	const scroll = useRef(0);
	const [isNear, setNear] = useState(false)
	const isNearRef = useRef(isNear)
	const [prevScroll, setPrevScroll] = useState(0)
	const boxGroupRef = useRef()

	const currentFace = useRef('front')
	const [video] = useState(() =>
		Object.assign(document.createElement('video'), {
			src: 'video/Ginger.mp4',
			// needed because the video is being hosted on a different server url
			crossOrigin: 'Anonymous',
			loop: true,
			// critical for iOS or the video won't initially play, and will go fullscreen when playing
			playsInline: true,
			// muted attribute is required for videos to autoplay
			muted: true,
		}),
	)
	const [video2] = useState(() =>
		Object.assign(document.createElement('video'), {
			src: 'video/Ricardo.mp4',
			crossOrigin: 'Anonymous',
			loop: true,
			playsInline: true,
			muted: true,
		}),
	)
	const [video3] = useState(() =>
		Object.assign(document.createElement('video'), {
			src: 'video/RicardoVert.mp4',
			crossOrigin: 'Anonymous',
			loop: true,
			playsInline: true,
			muted: true,
		}),
	)
	const [video4] = useState(() =>
		Object.assign(document.createElement('video'), {
			src: 'video/Ginger.mp4',
			crossOrigin: 'Anonymous',
			loop: true,
			playsInline: true,
			muted: true,
		}),
	)

	const firstResize = (texture) => {
		texture.current.repeat.x = isNear ? 1 : 0.88
		texture.current.repeat.y = isNear ? 1 : 0.27

		texture.current.offset.x = isNear ? 0 : 0.045
		texture.current.offset.y = isNear ? 0 : 0.37
	}

	const getViewportSizes = () => {
		if (frontRef.current) {
			if(isTablet() || isMobile()) {
				return {
					x: viewport.width / frontRef.current.geometry.parameters.width,
					y: viewport.height * 1.25
				}
			}

			return {
				x: viewport.width / frontRef.current.geometry.parameters.width - 0.1,
				y: viewport.height * 1.17
			}
		}
		return {
			x: 0,
			y: 0
		}
	}

	const resizeTexture = (texture) => {
		clickTimeline.add('resize')
			.to(boxGroupRef.current.rotation, {
				duration: 0.3,
				x: scrollCheckPoints[currentFace.current].radian,
				y: 0,
				ease: 'power3',
				onStart: () => {
					clickTimeline.add('resize')
						.to(texture.current.repeat, {
							duration: 1,
							x: isNear ? 1 : 0.88,
							y: isNear ? 1 : 0.27,
							ease: 'power3'
						}, 'resize')
						.to(texture.current.offset, {
							duration: 1,
							x: isNear ? 0 : 0.045,
							y: isNear ? 0 : 0.37,
							ease: 'power3'
						}, 'resize')
						.to(frontRef.current.scale, {
							duration: 1,
							y: isNear ? getViewportSizes().y : 1,
							x: isNear ? getViewportSizes().x : 1,
							ease: 'power3'
						}, 'resize')
						.to(camera.position, {
							duration: 1,
							y: isNear ? 0 : -state.mouse.y * 2,
							x: isNear ? 0 : state.mouse.x * 2,
							z: 4,
							ease: 'power3',
							onStart: () => {
								if (!isLockMove) {
									camera.position.lerp(
										new THREE.Vector3(state.mouse.x * 2, -state.mouse.y * 2, 4),
										0.05
									)
								}
							}
						}, 'resize')

					if (isNear) {
						window.scrollTo(0, scrollCheckPoints[currentFace.current]?.scroll)
					}
				}
			}, 'resize')
	}

	const wrapTextureInner = (texture) => {
		if (texture.current) {
			resizeTexture(texture)
		}
	}

	const wrapTexture = () => {
		if (currentFace.current === 'front') {
			// video.muted = !isNear
			wrapTextureInner(frontTexture)
		}
		if (currentFace.current === 'top') {
			// video2.muted = !isNear
			wrapTextureInner(topTexture)
		}
		if (currentFace.current === 'back') {
			// video3.muted = !isNear
			wrapTextureInner(backTexture)
		}
		if (currentFace.current === 'bottom') {
			// video4.muted = !isNear
			wrapTextureInner(bottomTexture)
		}
	}

	const rotateToCheckPoint = (scroll, position) => {
		if (currentSide !== position) {
			elapsedTimeSide.current = 0
		}
		currentSide = position
		if (elapsedTimeSide.current >= rotationDelay) {
			scrollX.value = scroll / (scrollHeight - window.innerHeight)
			elapsedTimeSide.current = 0
			window.scrollTo(0, scrollCheckPoints[position].scroll)
		}
	}

	const preventScroll = (e) => {
		if (isNearRef.current) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	useEffect(() => {
		if (isNear) {
			document.getElementById('root').classList.add('noscroll')
		} else {
			document.getElementById('root').classList.remove('noscroll')
		}
		isNearRef.current = isNear
	}, [isNear])

	const handleFaceClick = (face, event) => {
		lockMouseOffset.current = !lockMouseOffset.current
		isLockMove = !isLockMove
		currentFace.current = face
		setNear(!isNear)
		frontRef.current = event.object
		elapsedTimeSide.current = 0

		switch (face) {
			case 'front':
				faceMaterialFront.current.color = new THREE.Color('rgb(255,255,255)')
				break
			case 'top':
				faceMaterialTop.current.color = new THREE.Color('rgb(255,255,255)')
				break
			case 'back':
				faceMaterialBack.current.color = new THREE.Color('rgb(255,255,255)')
				break
			case 'bottom':
				faceMaterialBottom.current.color = new THREE.Color('rgb(255,255,255)')
				break
		}
	}

	const handleScroll = useCallback((event) => {
		if (!lockMouseOffset.current && !isLockMove) {
			scrollX.value = window.scrollY * -Math.PI * 1.5 / (scrollHeight - window.innerHeight)
			boxGroupRef.current.rotation.set(scrollX.value, 0, 0)
			scroll.current = scrollX.value
		}
	}, [isLockMove]);

	const mouseMove = useCallback((event) => {
		if (!isLockMove) {
			// camera.position.x += (-mouse.x - camera.position.x);
			// camera.position.y += (-mouse.y - camera.position.y);
			// camera.lookAt(scene.position);
		}

		mouse = {
			x: event.clientX / window.innerWidth * 2 - 1,
			y: -(event.clientY / window.innerHeight) * 2 + 1,
		}
	}, [])

	useLayoutEffect(() => {
		window.addEventListener('mousemove', mouseMove)
		window.addEventListener('scroll', handleScroll)
		window.addEventListener('wheel', preventScroll, {passive: false})

		return () => {
			window.removeEventListener('mousemove', mouseMove)
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('wheel', preventScroll, {passive: false})
		}
	}, [])

	// первонач-е масштаб-е текстур на гранях
	useEffect(() => {
		window.scrollTo(0, 0)

		if (frontTexture.current) {
			firstResize(frontTexture)
			firstResize(topTexture)
			firstResize(backTexture)
			firstResize(bottomTexture)
		}
	}, [frontTexture.current, backTexture.current, topTexture.current, bottomTexture.current]);

	useEffect(() => {
		scrollToCheckpoint.current[currentFace.current] = true
		wrapTexture()
	}, [isNear])

	//запуск видео и задание мастаб-ти
	useEffect(() => {
		video.play()
		video2.play()
		video3.play()
		video4.play()

		if (frontTexture?.current?.wrapT) {
			frontTexture.current.wrapS = frontTexture.current.wrapT = THREE.ClampToEdgeWrapping
			topTexture.current.wrapS = topTexture.current.wrapT = THREE.ClampToEdgeWrapping
			backTexture.current.wrapS = backTexture.current.wrapT = THREE.ClampToEdgeWrapping
			bottomTexture.current.wrapS = bottomTexture.current.wrapT = THREE.ClampToEdgeWrapping
		}
	}, [video, video2, video3, video4])

	//событие на изм-е фронтальной грани (на него можно вешать внешние события)
	useEffect(() => {
		window.dispatchEvent(new CustomEvent('changeTitle', {
			detail: {
				face: currentEdge
			}
		}))
	}, [currentEdge])

	//поворот куба в начальное сост-е если курсов в покое
	useEffect(() => {
		if (!isSceneHovered) {
			gsap.to(camera.position, {
				duration: 1,
				y: !isNear && 0,
				x: !isNear && 0,
				z: 4,
				ease: 'power3',
			})

			state.mouse.x = 0
			state.mouse.y = 0
		}
	}, [isSceneHovered])

	useFrame((state) => {
		state.camera.lookAt(scene.position);

		if (!isLockMove) {
			state.camera.position.lerp(
				new THREE.Vector3(state.mouse.x * 2, -state.mouse.y * 2, 4),
				0.05
			)
		}

		const newView = [viewport.width * 0.3, viewport.width * 0.88]
		setGeometryArgs([viewport.width - newView[0], viewport.width - newView[1], viewport.width - newView[1]]);

		setFacesPositions({
			front: {
				sizes: [geometryArgs[0], geometryArgs[1]],
				position: [0, 0, geometryArgs[1] / 2],
				rotation: []
			},
			top: {
				sizes: [geometryArgs[0], geometryArgs[1]],
				position: [0, geometryArgs[1] / 2, 0],
				rotation: [-Math.PI / 2, 0, 0]
			},
			bottom: {
				sizes: [geometryArgs[0], geometryArgs[1]],
				position: [0, -geometryArgs[1] / 2, 0],
				rotation: [Math.PI / 2, 0, 0]
			},
			back: {
				sizes: [geometryArgs[0], geometryArgs[1]],
				position: [0, 0, -geometryArgs[1] / 2],
				rotation: [0, Math.PI, 0]
			},
			left: {
				sizes: [geometryArgs[1], geometryArgs[1]],
				position: [-geometryArgs[0] / 2, 0, 0],
				rotation: [0, -Math.PI / 2, 0]
			},
			right: {
				sizes: [geometryArgs[1], geometryArgs[1]],
				position: [geometryArgs[0] / 2, 0, 0],
				rotation: [0, Math.PI / 2, 0]
			},
		})

		if ([scrollCheckPoints.front.scroll].includes(window.scrollY)) {
			elapsedTimeSide.current = 0
		}

		//докрутка до контрольной точки
		if (!isNear) {
			setPrevScroll(window.scrollY)
			if (prevScroll === window.scrollY) { //если находится в покое
				if (window.scrollY > 0 && window.scrollY < scrollCheckPoints.bottom.scroll / 2) {
					elapsedTimeSide.current++
					rotateToCheckPoint(scrollCheckPoints.front.scroll, 'front')
				} else if (window.scrollY > (scrollCheckPoints.bottom.scroll / 2) &&
					window.scrollY < (scrollCheckPoints.back.scroll / 2 + scrollCheckPoints.bottom.scroll / 2)
				) {
					elapsedTimeSide.current++
					rotateToCheckPoint(scrollCheckPoints.bottom.scroll, 'bottom')
				} else if (window.scrollY > (scrollCheckPoints.back.scroll / 2 + scrollCheckPoints.bottom.scroll / 2) &&
					window.scrollY < (scrollHeight - window.innerHeight - scrollCheckPoints.bottom.scroll / 2)) {
					elapsedTimeSide.current++
					rotateToCheckPoint(scrollCheckPoints.back.scroll, 'back')
				} else if (window.scrollY > (scrollHeight - window.innerHeight - scrollCheckPoints.bottom.scroll / 2)) {
					elapsedTimeSide.current++
					rotateToCheckPoint(scrollCheckPoints.top.scroll, 'top')
				}
			}
		}

		if (faceMaterialFront.current) {
			faceMaterialFront.current.color = new THREE.Color('rgb(28,27,27)')
			faceMaterialTop.current.color = new THREE.Color('rgb(28,27,27)')
			faceMaterialBack.current.color = new THREE.Color('rgb(28,27,27)')
			faceMaterialBottom.current.color = new THREE.Color('rgb(28,27,27)')

			if (window.scrollY <= scrollCheckPoints.bottom.scroll / 2) {
				faceMaterialFront.current.color = new THREE.Color('rgb(255,255,255)')
				setCurrentEdge('front')
			} else if (window.scrollY > (scrollCheckPoints.bottom.scroll / 2) &&
				window.scrollY <= (scrollCheckPoints.back.scroll / 2 + scrollCheckPoints.bottom.scroll / 2)
			) {
				faceMaterialBottom.current.color = new THREE.Color('rgb(255,255,255)')
				setCurrentEdge('bottom')
			} else if (window.scrollY > (scrollCheckPoints.back.scroll / 2 + scrollCheckPoints.bottom.scroll / 2) &&
				window.scrollY <= (scrollHeight - window.innerHeight - scrollCheckPoints.bottom.scroll / 2)) {
				faceMaterialBack.current.color = new THREE.Color('rgb(255,255,255)')
				setCurrentEdge('back')
			} else {
				faceMaterialTop.current.color = new THREE.Color('rgb(255,255,255)')
				setCurrentEdge('top')
			}
		}
	})

	return (
		<group ref={boxGroupRef}>
			{facesPositions?.front?.position && (
				<>
					<mesh
						ref={frontRef}
						onClick={(event) => handleFaceClick('front', event)}
						position={facesPositions.front.position}
					>
						<planeBufferGeometry args={facesPositions.front.sizes}/>
						<meshBasicMaterial ref={faceMaterialFront} color={'#ffffff'} toneMapped={false}>
							<videoTexture ref={frontTexture} attach="map" args={[video]} encoding={THREE.sRGBEncoding}/>
						</meshBasicMaterial>
					</mesh>
					<mesh
						onClick={(event) => handleFaceClick('right', event)}
						rotation={facesPositions.right.rotation}
						position={facesPositions.right.position}
					>
						<planeBufferGeometry args={facesPositions.right.sizes}/>
						<meshBasicMaterial color={'#000000'}/>
					</mesh>
					<mesh
						onClick={(event) => handleFaceClick('left', event)}
						position={facesPositions.left.position}
						rotation={facesPositions.left.rotation}
					>
						<planeBufferGeometry args={facesPositions.left.sizes}/>
						<meshBasicMaterial color={'#000000'}/>
					</mesh>
					<mesh
						onClick={(event) => handleFaceClick('back', event)}
						position={facesPositions.back.position}
						rotation={facesPositions.back.rotation}
					>
						<planeBufferGeometry args={facesPositions.back.sizes}/>
						<meshBasicMaterial ref={faceMaterialBack} color={'#ffffff'}>
							<videoTexture ref={backTexture} attach="map" args={[video3]} encoding={THREE.sRGBEncoding}/>
						</meshBasicMaterial>
					</mesh>
					<mesh
						onClick={(event) => handleFaceClick('top', event)}
						position={facesPositions.top.position}
						rotation={facesPositions.top.rotation}
					>
						<planeBufferGeometry args={facesPositions.top.sizes}/>
						<meshBasicMaterial ref={faceMaterialTop} color={'#ffffff'}>
							<videoTexture ref={topTexture} attach="map" args={[video2]} encoding={THREE.sRGBEncoding}/>
						</meshBasicMaterial>
					</mesh>
					<mesh
						onClick={(event) => handleFaceClick('bottom', event)}
						position={facesPositions.bottom.position}
						rotation={facesPositions.bottom.rotation}
					>
						<planeBufferGeometry args={facesPositions.bottom.sizes}/>
						<meshBasicMaterial ref={faceMaterialBottom} color={'#ffffff'}>
							<videoTexture ref={bottomTexture} attach="map" args={[video4]} encoding={THREE.sRGBEncoding}/>
						</meshBasicMaterial>
					</mesh>
				</>
			)}
		</group>
	)
}