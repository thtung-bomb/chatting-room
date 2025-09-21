import React from 'react'
import { Card } from '../ui/card'

function AuthForm({ children }: { children?: React.ReactNode }) {
	return (
		<div className='max-h-screen flex flex-col items-center justify-center bg-background px-4'>
			<Card className="max-w-md mx-auto mt-10 p-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold text-foreground font-serif">Dudaji Chat</h1>
					<p className="text-muted-foreground">Chat app connect you with your friends</p>
				</div>
				{/* Form content goes here */}
				{children}
			</Card>
		</div>
	)
}

export default AuthForm
