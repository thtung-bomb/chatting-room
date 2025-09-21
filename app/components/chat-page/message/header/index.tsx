import type { ChatRoom } from 'types/Chat';
import { Avatar } from '~/components/ui/avatar';
import { formatLastSeen } from 'util/helper';

interface ChatHeaderProps {
	currentRoom: ChatRoom
}

function ChatHeader({ currentRoom }: ChatHeaderProps) {
	return (
		<div className="p-4 border-b border-border bg-card shadow-sm">
			<div className="flex items-center space-x-3">
				<Avatar className="h-10 w-10 ring-2 ring-background">
					<img src={"https://cdn3.iconfinder.com/data/icons/communication-media-malibu-vol-1/128/group-chat-1024.png"} alt="Avatar" />
				</Avatar>
				<div className="flex-1">
					<h2 className="font-semibold text-card-foreground">{currentRoom?.name || "Chọn một phòng chat"}</h2>
					<p className="text-sm text-muted-foreground flex items-center">
						<div
							className={`w-2 h-2 rounded-full mr-2 ${currentRoom?.isOnline ? "bg-green-500" : "bg-gray-400"}`}
						></div>
						{currentRoom?.isOnline
							? `${currentRoom.memberCount} thành viên • Đang hoạt động`
							: `Hoạt động ${formatLastSeen(currentRoom?.timestamp || new Date())}`}
					</p>
				</div>
			</div>
		</div>
	)
}

export default ChatHeader
