"use client"

import type React from "react"

import { useContext, useState } from "react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useNavigate } from "react-router"
import { useUser } from "~/lib/userContext"

export default function Login() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()
	const { login } = useUser()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await login(email, password)
			console.log("Login successful:", response)
			navigate("/chat")
		} catch (error) {
			console.error("Login failed:", error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
			<Card className="w-full max-w-md p-8 space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground font-[Space_Grotesk]">Đăng nhập</h1>
					<p className="text-muted-foreground">Nhập thông tin để truy cập tài khoản</p>
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
						<Label htmlFor="password">Mật khẩu</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<Button
						type="submit"
						className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
						disabled={isLoading}
					>
						{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
					</Button>
				</form>

				<div className="text-center">
					<Link to="/" className="text-sm text-accent hover:underline">
						← Quay lại trang chủ
					</Link>
				</div>
			</Card>
		</div>
	)
}
