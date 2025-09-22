import { useState } from 'react'
import { ref, get } from 'firebase/database'
import { db } from 'config/firebase'
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Avatar } from "~/components/ui/avatar"
import { RoomMemberManager } from "util/roomMemberManager"
import { useAppSelector } from "store/hooks"
import { selectUser } from "store/features/slice/useSlice"
import type { ChatRoom } from 'types/Chat'
import { toast } from 'sonner'

interface JoinRoomDialogProps {
	openDialog: boolean
	setOpenDialog: (open: boolean) => void
}

function JoinRoomDialog({ openDialog, setOpenDialog }: JoinRoomDialogProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<ChatRoom[]>([])
	const [loading, setLoading] = useState(false)
	const [requestMessage, setRequestMessage] = useState('')
	const user = useAppSelector(selectUser)

	// Tìm kiếm room
	const handleSearch = async () => {
		if (!searchQuery.trim() || !user?.uid) return

		setLoading(true)
		try {
			const roomsRef = ref(db, 'rooms')
			const snapshot = await get(roomsRef)

			if (snapshot.exists()) {
				const roomsData = snapshot.val()
				const results: ChatRoom[] = []

				Object.entries(roomsData).forEach(([roomId, roomData]: [string, any]) => {
					// Chỉ tìm room có tên match và user chưa join
					const roomName = roomData.name || ''
					const userId = user.uid || ''
					const isAlreadyMember = roomData.members && roomData.members[userId]
					const hasPendingRequest = roomData.joinRequests && roomData.joinRequests[userId]

					if (roomName.toLowerCase().includes(searchQuery.toLowerCase())
						&& !isAlreadyMember && !hasPendingRequest) {
						results.push({
							id: roomId,
							name: roomName,
							lastMessage: 'Tap to request join',
							timestamp: new Date(roomData.createdAt || Date.now()),
							unreadCount: 0,
							avatar: roomData.avatar || 'https://cdn3.iconfinder.com/data/icons/communication-media-malibu-vol-1/128/group-chat-1024.png',
							isOnline: false,
							createdBy: roomData.createdBy,
							isPrivate: roomData.isPrivate || false,
							memberCount: roomData.members ? Object.keys(roomData.members).length : 0
						})
					}
				})

				setSearchResults(results)
			}
		} catch (error) {
			console.error('Error searching rooms:', error)
		} finally {
			setLoading(false)
		}
	}

	// Gửi request join
	const handleJoinRequest = async (roomId: string) => {
		if (!user?.uid) return

		try {
			await RoomMemberManager.sendJoinRequest(roomId, {
				uid: user.uid,
				displayName: user.displayName || undefined,
				email: user.email || undefined
			}, requestMessage)

			// Remove from search results
			setSearchResults(prev => prev.filter(room => room.id !== roomId))
			setRequestMessage('')
			toast.success('Request sent! Wait for admin approval.',
				{ position: 'top-center', richColors: true }
			)
		} catch (error) {
			console.error('Error sending join request:', error)
			toast.error('Failed to send request', { position: 'top-center', richColors: true })
		}
	}

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center">Find a room</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex gap-2">
						<Input
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value)
								handleSearch()
							}}
							placeholder="Enter room name..."
							className="flex-1"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault()
									handleSearch()
								}
							}}
						/>
						{/* <Button onClick={handleSearch} disabled={loading}>
							{loading ? 'Searching...' : 'Search'}
						</Button> */}
					</div>

					{/* Message for request */}
					<Input
						value={requestMessage}
						onChange={(e) => setRequestMessage(e.target.value)}
						placeholder="Message when requesting to join (optional)..."
						className="w-full"
					/>

					{/* Search Results */}
					<div className="max-h-64 overflow-y-auto space-y-2">
						{searchResults.map((room) => (
							<div key={room.id} className="flex items-center gap-3 p-3 border rounded-lg">
								<Avatar className="h-10 w-10">
									<img src={room.avatar} alt={room.name} />
								</Avatar>
								<div className="flex-1">
									<h4 className="font-medium">{room.name}</h4>
									<p className="text-sm text-muted-foreground">{room.memberCount} member{room.memberCount !== 1 ? 's' : ''}</p>
									{room.isPrivate && (
										<Badge variant="secondary" className="text-xs">Private</Badge>
									)}
								</div>
								<Button
									size="sm"
									onClick={() => handleJoinRequest(room.id)}
								>
									Request Join
								</Button>
							</div>
						))}

						{searchResults.length === 0 && searchQuery && !loading && (
							<p className="text-center text-muted-foreground py-4">
								No rooms found
							</p>
						)}
					</div>
				</div>

				<div className="flex justify-end">
					<Button variant="outline" onClick={() => {
						setOpenDialog(false)
						setSearchQuery('')
						setSearchResults([])
						setRequestMessage('')
					}}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default JoinRoomDialog