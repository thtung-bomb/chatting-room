import React from 'react'
import { Card } from '../ui/card'
import Login from './login'
import RegisterPage from './register'

function AuthForm({ children }: { children?: React.ReactNode }) {
	return (
		<div>
			<Card className="max-w-md mx-auto mt-10 p-6">
				{/* Form content goes here */}
				{children}
			</Card>
		</div>
	)
}

export default AuthForm
