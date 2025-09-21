import React from 'react'
import { Avatar } from '~/components/ui/avatar'

function TypingIndicator() {
	return (
		<div className="flex justify-start">
			<div className="flex items-center space-x-2">
				<Avatar className="h-6 w-6">
					<img src="/typing-user.jpg" alt="Typing" />
				</Avatar>
				<div className="bg-card text-card-foreground px-4 py-2 rounded-2xl border">
					<div className="flex space-x-1">
						<div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
						<div
							className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
							style={{ animationDelay: "0.1s" }}
						></div>
						<div
							className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
							style={{ animationDelay: "0.2s" }}
						></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TypingIndicator 
