import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { signOut } from 'firebase/auth'
import { useAppSelector, useAppDispatch } from 'store/hooks'
import { logout } from 'store/features/slice/useSlice'
import { auth } from 'config/firebase'
import { persistor } from 'store/store'
import { toast } from 'react-toastify'

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

// Hook to handle logout properly with Redux Persist
export function useLogout() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true)

			// Step 1: Sign out from Firebase Auth
			await signOut(auth)

			// Step 2: Clear Redux state (this will trigger Redux Persist to clear localStorage)
			dispatch(logout())

			// Step 3: Purge Redux Persist storage completely (optional but recommended)
			if (persistor) {
				await persistor.purge()
			}
			// Step 5: Navigate to login page
			navigate('/login')
		} catch (error) {
			toast.error('Logout failed: ' + (error as any).message)
		} finally {
			setIsLoggingOut(false)
		}
	}

	return {
		handleLogout,
		isLoggingOut
	}
}