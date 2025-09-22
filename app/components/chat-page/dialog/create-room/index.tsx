
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { RoomMemberManager } from "util/roomMemberManager"
import { useAppSelector } from "store/hooks"
import { selectUser } from "store/features/slice/useSlice"

interface CreateRoomDialogProps {
	openDialog: boolean
	setOpenDialog: (open: boolean) => void
	setSelectedChat: (chatId: string) => void
	roomName: string
	setRoomName: (name: string) => void
}

function CreateRoomDialog({ openDialog, setOpenDialog, setSelectedChat, roomName, setRoomName }: CreateRoomDialogProps) {
	const user = useAppSelector(selectUser)

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center">Create new chat room</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<Input
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
						placeholder="Enter room name to create chat..."
						className="w-full focus:ring-2 focus:ring-ring"
						onKeyDown={(e) => {
							if (e.key === "Enter" && roomName.trim()) {
								e.preventDefault()
								document.getElementById("create-room-btn")?.click()
							}
						}}
					/>
				</div>
				<DialogFooter className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => {
							setOpenDialog(false)
							setRoomName("")
						}}
					>
						Hủy
					</Button>
					<Button
						id="create-room-btn"
						onClick={async () => {
							if (roomName.trim() && user?.uid) {
								try {
									// ✅ Tạo room với RoomMemberManager - người tạo là admin
									const roomId = await RoomMemberManager.createRoom(roomName.trim(), {
										uid: user.uid,
										displayName: user.displayName || undefined,
										email: user.email || undefined
									})
									setSelectedChat(roomId)
									setRoomName("")
									setOpenDialog(false)
								} catch (error) {
									console.error("Error creating room:", error)
								}
							}
						}}
						disabled={!roomName.trim()}
						className="bg-primary hover:bg-primary/90"
					>
						Tạo phòng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default CreateRoomDialog