import { useEffect, useState } from 'react'
import { useAppSelector } from 'store/hooks'

// Custom hook to check if Redux Persist has finished hydrating
export function useIsHydrated() {
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		// Check if we're on the client side
		if (typeof window !== 'undefined') {
			// Small delay to ensure persist has had time to hydrate
			const timer = setTimeout(() => {
				setIsHydrated(true)
			}, 100)

			return () => clearTimeout(timer)
		}
	}, [])

	return isHydrated
}

// Hook to safely get user data only after hydration
export function useAuthenticatedUser() {
	const user = useAppSelector((state) => state.user)
	const isHydrated = useIsHydrated()

	return {
		user: isHydrated ? user : null,
		isLoading: !isHydrated,
		isHydrated
	}
}