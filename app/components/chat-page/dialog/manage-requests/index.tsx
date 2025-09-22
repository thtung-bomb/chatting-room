import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from 'config/firebase'
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Avatar } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { RoomMemberManager } from "util/roomMemberManager"
import { useAppSelector } from "store/hooks"
import { selectUser } from "store/features/slice/useSlice"
import type { JoinRequest } from 'types/Chat'
import { formatTime } from 'util/helper'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface ManageRequestsDialogProps {
	openDialog: boolean
	setOpenDialog: (open: boolean) => void
	roomId: string | null
}

function ManageRequestsDialog({ openDialog, setOpenDialog, roomId }: ManageRequestsDialogProps) {
	const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
	const [loading, setLoading] = useState(false)
	const user = useAppSelector(selectUser)

	// Load join requests for the room
	useEffect(() => {
		if (!roomId || !openDialog) return

		const requestsRef = ref(db, `rooms/${roomId}/joinRequests`)
		const unsubscribe = onValue(requestsRef, (snapshot) => {
			if (snapshot.exists()) {
				const requestsData = snapshot.val()
				const requests = Object.values(requestsData).filter(
					(req: any) => req.status === 'pending'
				) as JoinRequest[]
				setJoinRequests(requests)
			} else {
				setJoinRequests([])
			}
		})

		return () => unsubscribe()
	}, [roomId, openDialog])

	// Approve request
	const handleApprove = async (userId: string) => {
		if (!roomId || !user?.uid) return

		setLoading(true)
		try {
			await RoomMemberManager.approveJoinRequest(roomId, userId, user.uid)
			toast.success('Request approved!', { position: 'top-center', richColors: true })
		} catch (error) {
			console.error('Error approving request:', error)
			toast.error('Failed to approve request', { position: 'top-center', richColors: true })
		} finally {
			setLoading(false)
		}
	}

	// Reject request
	const handleReject = async (userId: string) => {
		if (!roomId) return

		setLoading(true)
		try {
			await RoomMemberManager.rejectJoinRequest(roomId, userId)
			toast.info('Request rejected', { position: 'top-center', richColors: true })
		} catch (error) {
			console.error('Error rejecting request:', error)
			toast.error('Failed to reject request', { position: 'top-center', richColors: true })
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-center">Manage Join Requests</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{joinRequests.length === 0 ? (
						<p className="text-center text-muted-foreground py-4">
							No join requests
						</p>
					) : (
						<div className="max-h-64 overflow-y-auto space-y-3">
							{joinRequests.map((request) => (
								<div key={request.uid} className="flex items-center gap-3 p-3 border rounded-lg">
									<Avatar className="h-10 w-10">
										<div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
											{request.displayName.charAt(0).toUpperCase()}
										</div>
									</Avatar>
									<div className="flex-1 min-w-0">
										<h4 className="font-medium truncate">{request.displayName}</h4>
										<p className="text-sm text-muted-foreground truncate">{request.email}</p>
										{request.message && (
											<p className="text-xs text-muted-foreground italic mt-1 truncate">
												"{request.message}"
											</p>
										)}
										<div className="flex items-center gap-2 mt-1">
											<Badge variant="outline" className="text-xs">
												{formatTime(new Date(request.requestedAt))}
											</Badge>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleReject(request.uid)}
											disabled={loading}
										>
											<X className="h-4 w-4 text-red-700" />
										</Button>
										<Button
											size="sm"
											onClick={() => handleApprove(request.uid)}
											disabled={loading}
										>
											<Check className="h-4 w-4 text-green-700" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex justify-end">
					<Button variant="outline" onClick={() => setOpenDialog(false)}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ManageRequestsDialog