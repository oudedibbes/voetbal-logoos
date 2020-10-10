'use strict'
;(function (window, document) {
	;(function () {
		var lastTime = 0
		var vendors = ['ms', 'moz', 'webkit', 'o']
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime()
				var timeToCall = Math.max(0, 16 - (currTime - lastTime))
				var id = window.setTimeout(function () {
					callback(currTime + timeToCall)
				}, timeToCall)
				lastTime = currTime + timeToCall
				return id
			}

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id)
			}
	})()

	const elements = document.querySelectorAll('.sticky-content')
	//Stickyfill.add(elements)

	const body_content = document.querySelector('.site-content')
	const header = document.querySelector('header')
	const nav_content = document.querySelector('.navigation')
	if (
		typeof body_content != 'undefined' &&
		body_content != null &&
		typeof header != 'undefined' &&
		header != null &&
		typeof nav_content != 'undefined' &&
		nav_content != null
	) {
		const threshold = nav_content.getBoundingClientRect()

		window.addEventListener('scroll', function () {
			if (window.scrollY >= threshold.top) {
				//header.classList.add('header--fixed');
				nav_content.classList.add('--fixed')
			} else {
				//header.classList.remove('header--fixed');
				nav_content.classList.remove('--fixed')
			}
		})
	}

	function scrollToHalf(duration) {
		var heightDiff = document.body.scrollHeight - window.innerHeight,
			endValue = heightDiff / 2,
			start = null

		/* Set a default for the duration, in case it's not given. */
		duration = duration || 300

		/* Start the animation. */
		window.requestAnimationFrame(function step(now) {
			/* Normalise the start date and calculate the current progress. */
			start = !start ? now : start
			var progress = now - start

			/* Increment by a calculate step the value of the scroll top. */
			document.documentElement.scrollTop = (endValue * progress) / duration
			document.body.scrollTop = (endValue * progress) / duration

			/* Check whether the current progress is less than the given duration. */
			if (progress < duration) {
				/* Execute the function recursively. */
				window.requestAnimationFrame(step)
			} else {
				/* Set the scroll top to the end value. */
				document.documentElement.scrollTop = endValue
				document.body.scrollTop = endValue
			}
		})
	}

	function scrollToSection(element) {
		/* Scroll until the button's next sibling comes into view. */
		element.nextElementSibling.scrollIntoView({ block: 'start', behavior: 'smooth' })
	}

	// SETUP
	// /////////////////////////////////
	// assign names to things we'll need to use more than once
	const csScroll = nav_content.getBoundingClientRect()
	const csSelector = document.querySelector('#myCustomSelect') // the input, svg and ul as a group
	const csInput = csSelector.querySelector('input')
	const csList = csSelector.querySelector('ul')
	const csOptions = csList.querySelectorAll('li')
	const csIcons = csSelector.querySelectorAll('svg')
	const csStatus = document.querySelector('#custom-select-status')
	const aOptions = Array.from(csOptions)

	// when JS is loaded, set up our starting point
	// if JS fails to load, the custom select remains a plain text input
	// create and set start point for the state tracker
	let csState = 'initial'
	// inform assistive tech (screen readers) of the names & roles of the elements in our group
	csSelector.setAttribute('role', 'combobox')
	csSelector.setAttribute('aria-haspopup', 'listbox')
	csSelector.setAttribute('aria-owns', 'custom-select-list') // container owns the list...
	csInput.setAttribute('aria-autocomplete', 'both')
	csInput.setAttribute('aria-controls', 'custom-select-list') // ...but the input controls it
	csList.setAttribute('role', 'listbox')
	csOptions.forEach(function (option) {
		option.setAttribute('role', 'option')
		option.setAttribute('tabindex', '-1') // make li elements keyboard focusable by script only
	})
	// set up a message to keep screen reader users informed of what the custom input is for/doing
	csStatus.textContent = csOptions.length + ' options available. Arrow down to browse or start typing to filter.'

	// EVENTS
	// /////////////////////////////////
	csSelector.addEventListener('click', function (e) {
		const currentFocus = findFocus()

		switch (csState) {
			case 'initial': // if state = initial, toggleOpen and set state to opened
				toggleList('Open')
				setState('opened')
				break
			case 'opened':
				// if state = opened and focus on input, toggleShut and set state to initial
				if (currentFocus === csInput) {
					toggleList('Shut')
					setState('initial')
				} else if (currentFocus.tagName === 'LI') {
					// if state = opened and focus on list, makeChoice, toggleShut and set state to closed
					makeChoice(currentFocus)
					toggleList('Shut')
					setState('closed')
				}
				break
			case 'filtered':
				// if state = filtered and focus on list, makeChoice and set state to closed
				if (currentFocus.tagName === 'LI') {
					makeChoice(currentFocus)
					toggleList('Shut')
					setState('closed')
				} // if state = filtered and focus on input, do nothing (wait for next user input)

				break
			case 'closed': // if state = closed, toggleOpen and set state to filtered? or opened?
				toggleList('Open')
				setState('filtered')
				break
		}

		scrollToSection(navigation)
	})

	csSelector.addEventListener('keyup', function (e) {
		doKeyAction(e.key)
	})

	document.addEventListener('click', function (e) {
		if (!e.target.closest('#myCustomSelect')) {
			// click outside of the custom group
			toggleList('Shut')
			setState('initial')
		}
	})

	// FUNCTIONS
	// /////////////////////////////////

	function toggleList(whichWay) {
		if (whichWay === 'Open') {
			csList.classList.remove('hidden-all')
			csSelector.setAttribute('aria-expanded', 'true')
		} else {
			// === 'Shut'
			csList.classList.add('hidden-all')
			csSelector.setAttribute('aria-expanded', 'false')
		}
	}

	function findFocus() {
		const focusPoint = document.activeElement
		return focusPoint
	}

	function moveFocus(fromHere, toThere) {
		// grab the currently showing options, which might have been filtered
		const aCurrentOptions = aOptions.filter(function (option) {
			if (option.style.display === '') {
				return true
			}
		})
		// don't move if all options have been filtered out
		if (aCurrentOptions.length === 0) {
			return
		}
		if (toThere === 'input') {
			csInput.focus()
		}
		// possible start points
		switch (fromHere) {
			case csInput:
				if (toThere === 'forward') {
					aCurrentOptions[0].focus()
				} else if (toThere === 'back') {
					aCurrentOptions[aCurrentOptions.length - 1].focus()
				}
				break
			case csOptions[0]:
				if (toThere === 'forward') {
					aCurrentOptions[1].focus()
				} else if (toThere === 'back') {
					csInput.focus()
				}
				break
			case csOptions[csOptions.length - 1]:
				if (toThere === 'forward') {
					aCurrentOptions[0].focus()
				} else if (toThere === 'back') {
					aCurrentOptions[aCurrentOptions.length - 2].focus()
				}
				break
			default:
				// middle list or filtered items
				const currentItem = findFocus()
				const whichOne = aCurrentOptions.indexOf(currentItem)
				if (toThere === 'forward') {
					const nextOne = aCurrentOptions[whichOne + 1]
					nextOne.focus()
				} else if (toThere === 'back' && whichOne > 0) {
					const previousOne = aCurrentOptions[whichOne - 1]
					previousOne.focus()
				} else {
					// if whichOne = 0
					csInput.focus()
				}
				break
		}
	}

	function doFilter() {
		const terms = csInput.value
		const aFilteredOptions = aOptions.filter(function (option) {
			if (option.innerText.toUpperCase().startsWith(terms.toUpperCase())) {
				return true
			}
		})
		csOptions.forEach(option => (option.style.display = 'none'))
		aFilteredOptions.forEach(function (option) {
			option.style.display = ''
		})
		setState('filtered')
		updateStatus(aFilteredOptions.length)
	}

	function updateStatus(howMany) {
		csStatus.textContent = howMany + ' options available.'
	}

	function makeChoice(whichOption) {
		const optionTitle = whichOption.querySelector('strong')
		csInput.value = optionTitle.textContent
		moveFocus(document.activeElement, 'input')
		// update aria-selected, if using
	}

	function setState(newState) {
		switch (newState) {
			case 'initial':
				csState = 'initial'
				break
			case 'opened':
				csState = 'opened'
				break
			case 'filtered':
				csState = 'filtered'
				break
			case 'closed':
				csState = 'closed'
		}
		// console.log({csState})
	}

	function doKeyAction(whichKey) {
		const currentFocus = findFocus()
		switch (whichKey) {
			case 'Enter':
				if (csState === 'initial') {
					// if state = initial, toggleOpen and set state to opened
					toggleList('Open')
					setState('opened')
				} else if (csState === 'opened' && currentFocus.tagName === 'LI') {
					// if state = opened and focus on list, makeChoice and set state to closed
					makeChoice(currentFocus)
					toggleList('Shut')
					setState('closed')
				} else if (csState === 'opened' && currentFocus === csInput) {
					// if state = opened and focus on input, close it
					toggleList('Shut')
					setState('closed')
				} else if (csState === 'filtered' && currentFocus.tagName === 'LI') {
					// if state = filtered and focus on list, makeChoice and set state to closed
					makeChoice(currentFocus)
					toggleList('Shut')
					setState('closed')
				} else if (csState === 'filtered' && currentFocus === csInput) {
					// if state = filtered and focus on input, set state to opened
					toggleList('Open')
					setState('opened')
				} else {
					// i.e. csState is closed, or csState is opened/filtered but other focus point?
					// if state = closed, set state to filtered? i.e. open but keep existing input?
					toggleList('Open')
					setState('filtered')
				}
				break

			case 'Escape':
				// if state = initial, do nothing
				// if state = opened or filtered, set state to initial
				// if state = closed, do nothing
				if (csState === 'opened' || csState === 'filtered') {
					toggleList('Shut')
					setState('initial')
				}
				break

			case 'ArrowDown':
				if (csState === 'initial' || csState === 'closed') {
					// if state = initial or closed, set state to opened and moveFocus to first
					toggleList('Open')
					moveFocus(csInput, 'forward')
					setState('opened')
				} else {
					// if state = opened and focus on input, moveFocus to first
					// if state = opened and focus on list, moveFocus to next/first
					// if state = filtered and focus on input, moveFocus to first
					// if state = filtered and focus on list, moveFocus to next/first
					toggleList('Open')
					moveFocus(currentFocus, 'forward')
				}
				break
			case 'ArrowUp':
				if (csState === 'initial' || csState === 'closed') {
					// if state = initial, set state to opened and moveFocus to last
					// if state = closed, set state to opened and moveFocus to last
					toggleList('Open')
					moveFocus(csInput, 'back')
					setState('opened')
				} else {
					// if state = opened and focus on input, moveFocus to last
					// if state = opened and focus on list, moveFocus to prev/last
					// if state = filtered and focus on input, moveFocus to last
					// if state = filtered and focus on list, moveFocus to prev/last
					moveFocus(currentFocus, 'back')
				}
				break
			default:
				if (csState === 'initial') {
					// if state = initial, toggle open, doFilter and set state to filtered
					toggleList('Open')
					doFilter()
					setState('filtered')
				} else if (csState === 'opened') {
					// if state = opened, doFilter and set state to filtered
					doFilter()
					setState('filtered')
				} else if (csState === 'closed') {
					// if state = closed, doFilter and set state to filtered
					doFilter()
					setState('filtered')
				} else {
					// already filtered
					doFilter()
				}
				break
		}
	}
})(window, document)

const visible = document.querySelector('.visible')
const invisible = document.querySelector('.invisible')

const theme = localStorage.getItem('theme')
if (theme === 'dark') {
	document.documentElement.setAttribute('data-theme', 'dark')
}

const userPrefers = getComputedStyle(document.documentElement).getPropertyValue('content')

if (theme === 'dark') {
	document.getElementById('theme-toggle').innerHTML = 'Light Mode'
} else if (theme === 'light') {
	document.getElementById('theme-toggle').innerHTML = 'Dark Mode'
} else if (userPrefers === 'dark') {
	document.documentElement.setAttribute('data-theme', 'dark')
	window.localStorage.setItem('theme', 'dark')
	document.getElementById('theme-toggle').innerHTML = 'Light Mode'
} else {
	document.documentElement.setAttribute('data-theme', 'light')
	window.localStorage.setItem('theme', 'light')
	document.getElementById('theme-toggle').innerHTML = 'Dark Mode'
}

function modeSwitcher() {
	let currentMode = document.documentElement.getAttribute('data-theme')
	if (currentMode === 'dark') {
		document.documentElement.setAttribute('data-theme', 'light')
		window.localStorage.setItem('theme', 'light')
		document.getElementById('theme-toggle').innerHTML = 'Dark Mode'

		visible.classList.remove('visible')
		visible.classList.add('invisible')

		invisible.classList.remove('invisible')
		invisible.classList.add('visible')
	} else {
		document.documentElement.setAttribute('data-theme', 'dark')
		window.localStorage.setItem('theme', 'dark')
		document.getElementById('theme-toggle').innerHTML = 'Light Mode'

		visible.classList.remove('invisible')
		visible.classList.add('visible')

		invisible.classList.remove('visible')
		invisible.classList.add('invisible')
	}
}
