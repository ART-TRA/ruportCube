import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';

const titles = {
	front: 'front face',
	top: 'top face',
	back: 'back face',
	bottom: 'bottom face',
}

export const FrontLayout = ({ isLayoutVisible = true }) => {
	const [title, setTitle] = useState(titles.front)
	const [againVisible, setAgainVisible] = useState(false)
	const titleClassNames = classNames('title', {
		'title--again': againVisible
	})

	const changeTitle = (event) => {
		// setAgainVisible(true)
		// console.log('change', event.detail.face)
		setTitle(titles[event.detail.face])

		setTimeout(() => {
			setAgainVisible(true)
		}, 1000)
	}

	useEffect(() => {
		setAgainVisible(false)
	}, [])

	useLayoutEffect(() => {
		window.addEventListener('changeTitle', changeTitle)

		return () => window.removeEventListener('changeTitle', changeTitle)
	}, [])

	return (
		<>
			{isLayoutVisible && (
				<div className="front">
					<h1 className={titleClassNames}>Мы знаем что делать</h1>
					<div className="front--bottom">
						<h5>{title}</h5>
					</div>
				</div>
			)}
		</>
	);
}