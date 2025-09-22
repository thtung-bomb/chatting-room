import type { ChatRoom, JoinRequest } from 'types/Chat';
import { Avatar } from '~/components/ui/avatar';
import { formatLastSeen } from 'util/helper';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { Button } from '~/components/ui/button';
import { Settings, Search, Notebook, Dot } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { useAppSelector } from 'store/hooks';
import ManageRequestsDialog from '../../dialog/manage-requests';
import { onValue, ref } from 'firebase/database';
import { db } from 'config/firebase';

interface ChatHeaderProps {
	currentRoom: ChatRoom
	onSearchToggle: () => void
	isSearchOpen: boolean
}

function ChatHeader({ currentRoom, onSearchToggle, isSearchOpen }: ChatHeaderProps) {
	const user = useAppSelector((state) => state.user)
	const [openManageDialog, setOpenManageDialog] = useState(false)
	const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
	const roomId = currentRoom?.id

	// Listen for join requests if user is admin
	useEffect(() => {
		if (!currentRoom || !isAdminOfSelectedRoom()) {
			setJoinRequests([])
			return
		}

		console.log(`Listening to requests for room: ${currentRoom.id}`)
		const requestsRef = ref(db, `rooms/${currentRoom.id}/joinRequests`)
		const unsubscribe = onValue(requestsRef, (snapshot) => {
			if (snapshot.exists()) {
				const requestsData = snapshot.val()
				const requests = Object.values(requestsData).filter(
					(req: any) => req.status === 'pending'
				) as JoinRequest[]
				setJoinRequests(requests)
				console.log(`Found ${requests.length} pending requests`)
			} else {
				setJoinRequests([])
				console.log('No pending requests found')
			}
		})

		return () => unsubscribe()
	}, [currentRoom?.id, user?.uid]) // Dependencies: room change or user change


	// Check if user is admin of selected room
	const isAdminOfSelectedRoom = () => {
		if (!currentRoom || !user?.uid) return false
		return currentRoom?.members?.[user.uid]?.role === 'admin'
	}

	useEffect(() => {
		console.log(joinRequests)
	}, [currentRoom, user])

	return (
		<div className="p-4 border-b border-border bg-card shadow-sm">
			<div className="flex items-center space-x-3">
				<Avatar className="h-10 w-10 ring-2 ring-background">
					<img src={"https://cdn3.iconfinder.com/data/icons/communication-media-malibu-vol-1/128/group-chat-1024.png"} alt="Avatar" />
				</Avatar>
				<div className="flex-1">
					<h2 className="font-semibold text-card-foreground">{currentRoom?.name || "Join a room"}</h2>
					<p className="text-sm text-muted-foreground flex items-center">
						<div
							className={`w-2 h-2 rounded-full mr-2 ${currentRoom?.isOnline ? "bg-green-500" : "bg-gray-400"}`}
						></div>
						{currentRoom?.isOnline
							? `${currentRoom.memberCount} member${currentRoom.memberCount !== 1 ? 's' : ''} • Online`
							: `Active ${formatLastSeen(currentRoom?.timestamp || new Date())}`}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					{/* Search Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={isSearchOpen ? "default" : "outline"}
								size="sm"
								onClick={onSearchToggle}
								className="hover:bg-sidebar-accent/20 transition-colors"
							>
								<Search className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" align="center">
							<p>{isSearchOpen ? 'Close search' : 'Search messages'}</p>
						</TooltipContent>
					</Tooltip>

					{/* Manage Requests (only for admins) */}
					{isAdminOfSelectedRoom() && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="relative">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setOpenManageDialog(true)}
										className="hover:bg-sidebar-accent/20 transition-colors bg-transparent"
									>
										<Settings className="h-4 w-4" />
									</Button>
									{/* Red notification badge */}
									{joinRequests.length > 0 && (
										<div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-lg animate-pulse">
											{joinRequests.length > 9 ? '9+' : joinRequests.length}
										</div>
									)}
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom" align="center">
								<p>Manage requests</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>
			<ManageRequestsDialog
				openDialog={openManageDialog}
				setOpenDialog={setOpenManageDialog}
				roomId={currentRoom.id}
			/>
		</div>
	)
}

export default ChatHeader
