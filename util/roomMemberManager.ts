import { ref, set, get, serverTimestamp, onDisconnect, push } from 'firebase/database'
import { db } from 'config/firebase'
import type { RoomMember, JoinRequest } from 'types/Chat'

export class RoomMemberManager {
	// Tạo room mới với người tạo là admin
	static async createRoom(roomName: string, creatorUser: { uid: string, displayName?: string, email?: string }) {
		try {
			const roomRef = push(ref(db, 'rooms'))
			const roomId = roomRef.key!

			const roomData = {
				name: roomName, // ✅ Lưu tên thật
				createdBy: creatorUser.uid,
				createdAt: Date.now(),
				isPrivate: true, // Mặc định room cần approval
				avatar: 'https://cdn3.iconfinder.com/data/icons/communication-media-malibu-vol-1/128/group-chat-1024.png',
				members: {
					[creatorUser.uid]: {
						uid: creatorUser.uid,
						displayName: creatorUser.displayName || creatorUser.email || 'Anonymous',
						email: creatorUser.email || '',
						isOnline: true,
						lastSeen: Date.now(),
						joinedAt: Date.now(),
						role: 'admin' // ✅ Người tạo là admin
					} as RoomMember
				},
				joinRequests: {}, // Danh sách request rỗng
				messages: {} // Messages rỗng
			}

			await set(roomRef, roomData)
			console.log(`✅ Room "${roomName}" created by ${creatorUser.uid}`)
			return roomId
		} catch (error) {
			console.error('❌ Error creating room:', error)
			throw error
		}
	}

	// Gửi request join room 
	static async sendJoinRequest(roomId: string, user: { uid: string, displayName?: string, email?: string }, message?: string) {
		try {
			const requestRef = ref(db, `rooms/${roomId}/joinRequests/${user.uid}`)
			const requestData: JoinRequest = {
				uid: user.uid,
				displayName: user.displayName || user.email || 'Anonymous',
				email: user.email || '',
				requestedAt: Date.now(),
				status: 'pending',
				message: message || ''
			}

			await set(requestRef, requestData)
			console.log(`✅ Join request sent to room ${roomId}`)
		} catch (error) {
			console.error('Error sending join request:', error)
			throw error
		}
	}

	// ✅ Admin approve request
	static async approveJoinRequest(roomId: string, userId: string, adminId: string) {
		try {
			// Get request data
			const requestRef = ref(db, `rooms/${roomId}/joinRequests/${userId}`)
			const requestSnapshot = await get(requestRef)

			if (!requestSnapshot.exists()) {
				throw new Error('Join request not found')
			}

			const requestData = requestSnapshot.val() as JoinRequest

			// Add user to members
			const memberRef = ref(db, `rooms/${roomId}/members/${userId}`)
			const memberData: RoomMember = {
				uid: userId,
				displayName: requestData.displayName,
				email: requestData.email,
				isOnline: false,
				lastSeen: Date.now(),
				joinedAt: Date.now(),
				role: 'member',
				joinedBy: adminId
			}

			await set(memberRef, memberData)

			// Remove request
			await set(requestRef, null)

			console.log(`User ${userId} approved to join room ${roomId}`)
		} catch (error) {
			console.error('Error approving join request:', error)
			throw error
		}
	}

	// Admin reject request
	static async rejectJoinRequest(roomId: string, userId: string) {
		try {
			const requestRef = ref(db, `rooms/${roomId}/joinRequests/${userId}`)
			await set(requestRef, null)
			console.log(`Join request rejected for user ${userId}`)
		} catch (error) {
			console.error('Error rejecting join request:', error)
			throw error
		}
	}

	// Join a room (chỉ dùng cho admin hoặc approved members)
	static async joinRoom(roomId: string, user: { uid: string, displayName?: string, email?: string }) {
		try {
			const memberRef = ref(db, `rooms/${roomId}/members/${user.uid}`)
			const memberData: RoomMember = {
				uid: user.uid,
				displayName: user.displayName || user.email || 'Anonymous',
				email: user.email || '',
				isOnline: true,
				lastSeen: Date.now(),
				joinedAt: Date.now(),
				role: 'member'
			}

			await set(memberRef, memberData)

			// Set up disconnect handler
			const onlineRef = ref(db, `rooms/${roomId}/members/${user.uid}/isOnline`)
			const lastSeenRef = ref(db, `rooms/${roomId}/members/${user.uid}/lastSeen`)

			await onDisconnect(onlineRef).set(false)
			await onDisconnect(lastSeenRef).set(serverTimestamp())

			console.log(`✅ User ${user.uid} joined room ${roomId}`)
		} catch (error) {
			console.error('❌ Error joining room:', error)
			throw error
		}
	}

	// Leave a room  
	static async leaveRoom(roomId: string, userId: string) {
		try {
			const memberRef = ref(db, `rooms/${roomId}/members/${userId}`)
			await set(memberRef, null)
			console.log(`✅ User ${userId} left room ${roomId}`)
		} catch (error) {
			console.error('❌ Error leaving room:', error)
			throw error
		}
	}

	// Set online status
	static async setOnlineStatus(roomId: string, userId: string, isOnline: boolean) {
		try {
			const onlineRef = ref(db, `rooms/${roomId}/members/${userId}/isOnline`)
			const lastSeenRef = ref(db, `rooms/${roomId}/members/${userId}/lastSeen`)

			await set(onlineRef, isOnline)
			if (!isOnline) {
				await set(lastSeenRef, Date.now())
			}
		} catch (error) {
			console.error('❌ Error setting online status:', error)
		}
	}

	// Get room members with their details
	static async getRoomMembers(roomId: string): Promise<RoomMember[]> {
		try {
			const membersRef = ref(db, `rooms/${roomId}/members`)
			const snapshot = await get(membersRef)

			if (snapshot.exists()) {
				return Object.values(snapshot.val()) as RoomMember[]
			}
			return []
		} catch (error) {
			console.error('❌ Error getting room members:', error)
			return []
		}
	}
}