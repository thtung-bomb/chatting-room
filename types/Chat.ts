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
	members?: { [userId: string]: RoomMember }
	createdBy?: string // ID của người tạo room
	isPrivate?: boolean // Room riêng tư cần approval
	joinRequests?: { [userId: string]: JoinRequest } // Danh sách request join
}

export interface RoomMember {
	uid: string
	displayName: string
	email: string
	isOnline: boolean
	lastSeen: number
	joinedAt: number
	role: 'admin' | 'member' // Bắt buộc có role
	joinedBy?: string // ID của admin approve
}

export interface JoinRequest {
	uid: string
	displayName: string
	email: string
	requestedAt: number
	status: 'pending' | 'approved' | 'rejected'
	message?: string // Lời nhắn khi request join
}

export interface SenderInfo {
	uid?: string
	email?: string
}
