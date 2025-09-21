import { useState, useEffect } from 'react'

// === GOOGLE STANDARD: Responsive Breakpoints ===
export const BREAKPOINTS = {
	xs: 0,     // Mobile first
	sm: 640,   // Small devices (landscape phones)
	md: 768,   // Medium devices (tablets)
	lg: 1024,  // Large devices (laptops)
	xl: 1280,  // Extra large devices (desktops)
	xxl: 1536  // 2xl screens
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

// === Hook for responsive screen detection ===
export const useResponsive = () => {
	const [screenSize, setScreenSize] = useState<BreakpointKey>('lg')
	const [windowSize, setWindowSize] = useState({
		width: typeof window !== 'undefined' ? window.innerWidth : 1024,
		height: typeof window !== 'undefined' ? window.innerHeight : 768
	})

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth
			setWindowSize({ width, height: window.innerHeight })

			if (width >= BREAKPOINTS.xxl) {
				setScreenSize('xxl')
			} else if (width >= BREAKPOINTS.xl) {
				setScreenSize('xl')
			} else if (width >= BREAKPOINTS.lg) {
				setScreenSize('lg')
			} else if (width >= BREAKPOINTS.md) {
				setScreenSize('md')
			} else if (width >= BREAKPOINTS.sm) {
				setScreenSize('sm')
			} else {
				setScreenSize('xs')
			}
		}

		handleResize() // Set initial size
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const isMobile = screenSize === 'xs' || screenSize === 'sm'
	const isTablet = screenSize === 'md'
	const isDesktop = screenSize === 'lg' || screenSize === 'xl' || screenSize === 'xxl'
	const isSmallDesktop = screenSize === 'lg'
	const isLargeDesktop = screenSize === 'xl' || screenSize === 'xxl'

	return {
		screenSize,
		windowSize,
		isMobile,
		isTablet,
		isDesktop,
		isSmallDesktop,
		isLargeDesktop,
		breakpoints: BREAKPOINTS
	}
}

// === Hook for mobile sidebar management ===
export const useMobileSidebar = () => {
	const [isOpen, setIsOpen] = useState(false)
	const { isMobile } = useResponsive()

	const toggle = () => setIsOpen(!isOpen)
	const open = () => setIsOpen(true)
	const close = () => setIsOpen(false)

	// Close sidebar when screen becomes desktop
	useEffect(() => {
		if (!isMobile) {
			setIsOpen(false)
		}
	}, [isMobile])

	return {
		isOpen,
		toggle,
		open,
		close,
		isMobile
	}
}

// === Responsive utilities ===
export const getResponsiveValue = <T>(
	values: Partial<Record<BreakpointKey, T>>,
	currentBreakpoint: BreakpointKey,
	fallback: T
): T => {
	// Find the appropriate value based on current breakpoint
	const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
	const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

	for (let i = currentIndex; i >= 0; i--) {
		const bp = breakpointOrder[i]
		if (values[bp] !== undefined) {
			return values[bp]!
		}
	}

	return fallback
}

// === CSS utility for responsive container ===
export const getResponsiveContainer = (screenSize: BreakpointKey) => {
	switch (screenSize) {
		case 'xs':
		case 'sm':
			return 'px-4 max-w-full'
		case 'md':
			return 'px-6 max-w-3xl mx-auto'
		case 'lg':
			return 'px-8 max-w-5xl mx-auto'
		case 'xl':
		case 'xxl':
			return 'px-12 max-w-7xl mx-auto'
		default:
			return 'px-4 max-w-full'
	}
}