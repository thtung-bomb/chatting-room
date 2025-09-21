import { LogOut, Search, SquarePen, Users } from 'lucide-react'
import { Link } from 'react-router'
import type { UserState } from 'store/features/slice/useSlice'
import type { ChatRoom } from 'types/Chat'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { formatTime } from 'util/helper'

interface SidebarProps {
	user: UserState
	chatRooms: Array<ChatRoom>
	handleCreateRoom: () => void
	handleLogout: () => void
	handleSearchRoom: (query: string) => void
	searchRoom: string
	selectedChat: string | null
	setSelectedChat: (chatId: string) => void
	isLoggingOut: boolean
}

function Sidebar({ user, chatRooms, handleCreateRoom, handleLogout, isLoggingOut, handleSearchRoom, searchRoom, selectedChat, setSelectedChat }: SidebarProps) {
	return (
		<div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-sidebar-border">
				<div className="flex items-center justify-between">
					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="p-1">
								<Avatar className="h-8 w-8 hover-opacity-80 transition-opacity cursor-pointer">
									<img
										src="/placeholder.png"
										alt={user?.email || "User"}
									/>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem
								onClick={handleLogout}
								className="text-destructive"
								disabled={isLoggingOut}
							>
								<LogOut className="h-4 w-4 mr-2" />
								{isLoggingOut ? "Logging out..." : "Log out"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Link to="/" className="hover:opacity-80 transition-opacity">
						<h1 className="text-xl font-bold text-sidebar-foreground font-[Space_Grotesk]">Dudaji Chat</h1>
					</Link>
					<div className="">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={handleCreateRoom}
									className="hover:bg-sidebar-accent/20 transition-colors bg-transparent cursor-pointer"
								>
									<SquarePen className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom" align="center">
								<p className="bg-popover text-popover-foreground px-2 py-1 rounded text-sm border shadow-md">
									Create room
								</p>
							</TooltipContent>
						</Tooltip>

					</div>
				</div>
			</div>

			{/* Search */}
			<div className="p-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm phòng chat..."
						className="bg-background pl-10 border-input focus:ring-2 focus:ring-ring"
						value={searchRoom}
						onChange={(e) => handleSearchRoom(e.target.value)}
					/>
				</div>
			</div>

			{/* Chat List */}
			<div className="flex-1 overflow-y-auto">
				{chatRooms.length === 0 ? (
					<div className="p-4 text-center text-muted-foreground">
						<Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">{searchRoom ? "Không tìm thấy phòng chat nào" : "Chưa có phòng chat nào"}</p>
					</div>
				) : (
					chatRooms.map((room) => (
						<div
							key={room.id}
							className={`p-4 hover:bg-sidebar-accent/10 transition-all duration-200 border-l-2 ${selectedChat === room.id ? "bg-sidebar-accent/20 border-l-sidebar-primary" : "border-l-transparent"
								}`}
						>
							<div className="flex items-center space-x-3">
								<div
									className="flex-1 flex items-center space-x-3 cursor-pointer"
									onClick={() => setSelectedChat(room.id)}
								>
									<div className="relative">
										<Avatar className="h-12 w-12 ring-2 ring-background">
											<img
												src={"https://cdn3.iconfinder.com/data/icons/communication-media-malibu-vol-1/128/group-chat-1024.png"}
												alt={room.name}
											/>
										</Avatar>
										{room.isOnline && (
											<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-sidebar shadow-sm"></div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<h3 className="font-medium text-sidebar-foreground truncate">{room.name}</h3>
											<span className="text-xs text-muted-foreground">{formatTime(room.timestamp)}</span>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
												<p className="text-xs text-muted-foreground">{room.memberCount} members</p>
											</div>
											{room.unreadCount > 0 && (
												<Badge className="bg-sidebar-primary text-sidebar-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center ml-2">
													{room.unreadCount}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}

export default Sidebar
