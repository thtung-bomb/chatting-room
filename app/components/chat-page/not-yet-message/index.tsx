import { Users } from 'lucide-react'
import React from 'react'
import type { ChatRoom } from '~/routes/chat'

interface NotYetMessageProps {
	currentRoom?: ChatRoom
}

function NotYetMessage({ currentRoom }: NotYetMessageProps) {
	return (
		<div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
			<div>
				<div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
					<Users className="h-8 w-8" />
				</div>
				<p className="text-lg font-medium mb-2">Chưa có tin nhắn nào</p>
				<p className="text-sm">Hãy bắt đầu cuộc trò chuyện với {currentRoom?.name}!</p>
			</div>
		</div>
	)
}

export default NotYetMessage
