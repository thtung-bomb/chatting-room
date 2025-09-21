export interface Message {
	id: string
	text: string
	sender: string
	timestamp: Date
	type?: "text" | "file"
	fileUrl?: string
	fileName?: string
	fileType?: string // Add file type for better rendering
}

export interface ChatRoom {
	id: string
	name: string
	lastMessage: string
	timestamp: Date
	unreadCount: number
	avatar: string
	isOnline: boolean
	memberCount?: number
}

export interface SenderInfo {
	uid?: string
	email?: string
}
