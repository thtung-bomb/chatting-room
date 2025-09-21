
import { createRoomRef } from "config/firebase"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

interface CreateRoomDialogProps {
	openDialog: boolean
	setOpenDialog: (open: boolean) => void
	setSelectedChat: (chatId: string) => void
	roomName: string
	setRoomName: (name: string) => void
}

function CreateRoomDialog({ openDialog, setOpenDialog, setSelectedChat, roomName, setRoomName }: CreateRoomDialogProps) {
	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center">Tạo phòng chat mới</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<Input
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
						placeholder="Nhập tên phòng chat..."
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
							if (roomName.trim()) {
								try {
									const newRoom = await createRoomRef(roomName.trim())
									setSelectedChat(newRoom.key!)
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