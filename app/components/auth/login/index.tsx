import { auth } from 'config/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { MoveLeft } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useAppSelector, useAppDispatch } from 'store/hooks'
import { setUser } from 'store/features/slice/useSlice'

function Login() {

	const user = useAppSelector((state) => state.user)
	const dispatch = useAppDispatch()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		try {
			const response = await signInWithEmailAndPassword(auth, email, password)
			console.log('User logged in successfully', response)
			dispatch(setUser({
				uid: response.user.uid,
				displayName: response.user.displayName || '',
				email: response.user.email || ''
			}))
			navigate("/chat")
		} catch (error) {
			alert("Login failed: " + (error as any).message)
			return
		} finally {
			setIsLoading(false)
		}
	}
	return (
		<div className="max-h-full bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
			<Card className="w-full max-w-md p-8 space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground font-[Space_Grotesk]">Login</h1>
					<p className="text-muted-foreground w-full">Please enter your information <br /> to access your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="your@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

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

				<div className="text-gray-700 text-center">
					<Link to="/" className="flex justify-center align-center items-center gap-2 text-sm text-accent-foreground hover:underline">
						<MoveLeft className="inline-block mr-1" size={16} />
						Back to home
					</Link>
				</div>
			</Card>
		</div>
	)
}

export default Login
