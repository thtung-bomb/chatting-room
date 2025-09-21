import { useEffect, useState } from 'react'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistor } from 'store/store'

interface ClientOnlyPersistGateProps {
	children: React.ReactNode
	loading?: React.ReactNode
}

// Loading component for Redux Persist
const PersistLoading = () => (
	<div className="min-h-screen flex items-center justify-center bg-background">
		<div className="text-center space-y-4">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
			<p className="text-muted-foreground">Loading your session...</p>
		</div>
	</div>
)

export function ClientOnlyPersistGate({ children, loading }: ClientOnlyPersistGateProps) {
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	// On server or during initial render, show loading
	if (!isClient) {
		return loading || <PersistLoading />
	}

	// If no persistor (SSR fallback), just render children
	if (!persistor) {
		return <>{children}</>
	}

	// On client after hydration, use PersistGate with loading
	return (
		<PersistGate loading={loading || <PersistLoading />} persistor={persistor}>
			{children}
		</PersistGate>
	)
}