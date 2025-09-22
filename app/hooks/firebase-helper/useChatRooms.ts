import { useEffect, useState } from 'react'
import { ref, onValue, push, set, get } from 'firebase/database'
import { db } from 'config/firebase'
import { useAppSelector } from 'store/hooks'
import type { ChatRoom } from 'types/Chat'

export function useChatRooms() {
	const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
	const [loading, setLoading] = useState(true)
	const user = useAppSelector((state) => state.user)

	// Get member count for a specific room
	const getMemberCount = async (roomId: string): Promise<number> => {
		try {
			const membersRef = ref(db, `rooms/${roomId}/members`)
			const snapshot = await get(membersRef)
			if (snapshot.exists()) {
				return Object.keys(snapshot.val()).length
			}
			return 0
		} catch (error) {
			console.error('Error getting member count:', error)
			return 0
		}
	}

	// Get online members count
	const getOnlineMembersCount = async (roomId: string): Promise<number> => {
		try {
			const membersRef = ref(db, `rooms/${roomId}/members`)
			const snapshot = await get(membersRef)
			if (snapshot.exists()) {
				const members = snapshot.val()
				return Object.values(members).filter(
					(member: any) => member.isOnline
				).length
			}
			return 0
		} catch (error) {
			console.error('Error getting online members count:', error)
			return 0
		}
	}

	// Listen to chat rooms with real member counts
	useEffect(() => {
		if (!user?.uid) return

		const roomsRef = ref(db, 'rooms')

		const unsubscribe = onValue(roomsRef, async (snapshot) => {
			if (snapshot.exists()) {
				const roomsData = snapshot.val()
				const roomPromises = Object.entries(roomsData).map(async ([roomId, roomData]: [string, any]) => {
					// ✅ Chỉ hiển thị room mà user đã join (có role admin hoặc member)
					const userMembership = roomData.members && roomData.members[user.uid || 'Unknown User']
					const hasValidRole = userMembership && ['admin', 'member'].includes(userMembership.role)

					if (!hasValidRole) return null

					// Get real-time member count
					const memberCount = await getMemberCount(roomId)
					const onlineCount = await getOnlineMembersCount(roomId)

					// Get last message
					const messagesData = roomData.messages
					let lastMessage = 'No messages yet'
					let timestamp = roomData.createdAt || Date.now()

					if (messagesData) {
						const messages = Object.values(messagesData)
						const sortedMessages = messages.sort((a: any, b: any) => b.timestamp - a.timestamp)
						const latestMessage = sortedMessages[0] as any

						if (latestMessage) {
							lastMessage = latestMessage.text || (latestMessage.fileUrl ? 'File attachment' : 'Message')
							timestamp = latestMessage.timestamp
						}
					}

					return {
						id: roomId,
						name: roomData.name || `Room ${roomId.slice(0, 8)}`, // ✅ Lấy tên thật từ roomData.name
						lastMessage,
						timestamp: new Date(timestamp),
						unreadCount: 0,
						avatar: roomData.avatar || 'https://cdn3.iconfinder.com/data/icons/communication-media-malibu-vol-1/128/group-chat-1024.png',
						isOnline: onlineCount > 0,
						members: roomData.members || {},
						createdBy: roomData.createdBy || null, // ✅ Thông tin người tạo
						isPrivate: roomData.isPrivate || false, // ✅ Room có cần approval không
						joinRequests: roomData.joinRequests || {}, // ✅ Danh sách request
						// Additional properties for extended functionality
						memberCount,
						onlineCount
					} as ChatRoom & { memberCount: number, onlineCount: number }
				})

				const rooms = (await Promise.all(roomPromises))
					.filter(Boolean)
					.sort((a: any, b: any) => (b?.timestamp || 0) - (a?.timestamp || 0))

				setChatRooms(rooms as ChatRoom[])
			} else {
				setChatRooms([])
			}
			setLoading(false)
		})

		return () => unsubscribe()
	}, [user?.uid])

	return { chatRooms, loading, getMemberCount, getOnlineMembersCount }
}