import { auth } from 'config/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { MoveLeft } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useAppSelector, useAppDispatch } from 'store/hooks'
import { setUser } from 'store/features/slice/useSlice'
import { useAuthenticatedUser } from '~/hooks/useAuthState'
import { toast } from 'sonner'

function Login() {
	const dispatch = useAppDispatch()
	const { user, isHydrated } = useAuthenticatedUser()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	// Redirect if already logged in (after hydration)
	useEffect(() => {
		if (isHydrated && user?.uid) {
			console.log('User already logged in, redirecting to chat')
			navigate("/chat")
		}
	}, [isHydrated, user, navigate])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		try {
			const response = await signInWithEmailAndPassword(auth, email, password)
			console.log('✅ User logged in successfully', response)

			// Update Redux store with user data
			dispatch(setUser({
				uid: response.user.uid,
				displayName: response.user.displayName || '',
				email: response.user.email || ''
			}))

			// Navigate to chat - Redux Persist will save this automatically
			console.log('✅ Navigating to chat...')
			navigate("/chat")
			toast.success("Logged in successfully!", {
				richColors: true,
				position: "top-center"
			})
		} catch (error) {
			toast.error("Login failed: " + (error as any).message, {
				richColors: true,
				position: "bottom-center"
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Show loading while Redux Persist is hydrating
	if (!isHydrated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					{/* <p className="text-muted-foreground">Loading session...</p> */}
				</div>
			</div>
		)
	}
	return (
		<div className="font-sans">
			<Card className="w-full max-w-md px-8 space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground font-[Space_Grotesk]">Login</h1>
					<p className="text-muted-foreground w-full">Please enter your information to access your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="your@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="Your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<Button
						type="submit"
						className="w-full hover:bg-secondary/90 hover:text-black cursor-pointer"
						disabled={isLoading}
					>
						{isLoading ? "Logging in..." : "Login"}
					</Button>
				</form>

				<div className="text-center ">
					<Link to="/register" className="text-sm text-gray-700 hover:underline">
						Don't have an account? Register
					</Link>
				</div>
			</Card>
		</div >
	)
}

export default Login
