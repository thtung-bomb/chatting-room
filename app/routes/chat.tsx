"use client"

import type React from "react"

import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"
import { createRoomRef, pushMessage, roomMessagesRef, roomsRef } from "config/firebase"
import { off, onValue } from "firebase/database"
import { SquarePen, Send, Search, Users, LogOut, User, Paperclip, Smile } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Avatar } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Tooltip } from "~/components/ui/tooltip"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useUser } from "~/lib/userContext"
import { FileUpload } from "~/components/file-upload"

interface Message {
	id: string
	text: string
	sender: string
	timestamp: Date
	isOwn: boolean
	type?: "text" | "file"
	fileUrl?: string
	fileName?: string
}

interface ChatRoom {
	id: string
	name: string
	lastMessage: string
	timestamp: Date
	unreadCount: number
	avatar: string
	isOnline: boolean
	memberCount?: number
}

export default function Chat() {
	const [message, setMessage] = useState("")
	const [messages, setMessages] = useState<Message[]>([])
	const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
	const [originalChatRooms, setOriginalChatRooms] = useState<ChatRoom[]>([])
	const [openDialog, setOpenDialog] = useState(false)
	const [selectedChat, setSelectedChat] = useState("1")
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [roomName, setRoomName] = useState("")
	const [searchRoom, setSearchRoom] = useState("")
	const [isTyping, setIsTyping] = useState(false)
	const [showFileUpload, setShowFileUpload] = useState(false)
	const { user, logout } = useUser()
	const navigate = useNavigate()

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	// Simulate typing indicator
	useEffect(() => {
		if (message.length > 0) {
			setIsTyping(true)
			const timer = setTimeout(() => setIsTyping(false), 1000)
			return () => clearTimeout(timer)
		} else {
			setIsTyping(false)
		}
	}, [message])

	useEffect(() => {
		// Listen to rooms
		const roomsListener = onValue(roomsRef(), (snapshot) => {
			const data = snapshot.val()
			if (data) {
				const rooms: ChatRoom[] = Object.entries(data).map(([id, room]: [string, any]) => ({
					id,
					name: room.meta?.name || "Unknown Room",
					lastMessage: "Tin nhắn mới",
					timestamp: new Date(room.meta?.createdAt || Date.now()),
					unreadCount: Math.floor(Math.random() * 3), // Random unread count for demo
					avatar: "/diverse-user-avatars.png",
					isOnline: Math.random() > 0.3, // Higher chance of being online
					memberCount: Math.floor(Math.random() * 50) + 2, // Random member count
				}))
				setChatRooms(rooms)
				setOriginalChatRooms(rooms)
				if (rooms.length > 0 && !selectedChat) {
					setSelectedChat(rooms[0].id)
				}
			}
		})

		return () => {
			off(roomsRef(), "value", roomsListener)
		}
	}, [])

	useEffect(() => {
		if (!selectedChat) return

		const messagesListener = onValue(roomMessagesRef(selectedChat), (snapshot) => {
			const data = snapshot.val()
			if (data) {
				const msgs: Message[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
					id,
					text: msg.text || msg.content || "",
					sender: msg.sender || msg.user || "Unknown",
					timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
					isOwn: msg.sender === (user?.name || "Tôi") || msg.isOwn || false,
					type: msg.type || "text",
					fileUrl: msg.fileUrl,
					fileName: msg.fileName,
				}))
				setMessages(msgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))
			} else {
				setMessages([])
			}
		})

		return () => {
			off(roomMessagesRef(selectedChat), "value", messagesListener)
		}
	}, [selectedChat, user])

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!message.trim() || !selectedChat) return

		try {
			await pushMessage(selectedChat, {
				text: message,
				sender: user?.name || "Tôi",
				timestamp: Date.now(),
				isOwn: true,
				type: "text",
			})
			setMessage("")
		} catch (error) {
			console.error("Error sending message:", error)
		}
	}

	const handleFileUpload = async (fileUrl: string) => {
		if (!selectedChat) return

		try {
			const fileName = fileUrl.split("/").pop() || "file"
			await pushMessage(selectedChat, {
				text: `Đã chia sẻ file: ${fileName}`,
				sender: user?.name || "Tôi",
				timestamp: Date.now(),
				isOwn: true,
				type: "file",
				fileUrl,
				fileName,
			})
			setShowFileUpload(false)
		} catch (error) {
			console.error("Error sending file:", error)
		}
	}

	const handleCreateRoom = async () => {
		setOpenDialog(true)
	}

	const handleSearchRoom = (query: string) => {
		setSearchRoom(query)

		if (!query.trim()) {
			setChatRooms(originalChatRooms)
		} else {
			const filteredRooms = originalChatRooms.filter((room) => room.name.toLowerCase().includes(query.toLowerCase()))
			setChatRooms(filteredRooms)
		}
	}

	const handleLogout = () => {
		logout()
		navigate("/")
	}

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	const formatLastSeen = (date: Date) => {
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const minutes = Math.floor(diff / 60000)

		if (minutes < 1) return "Vừa xong"
		if (minutes < 60) return `${minutes} phút trước`
		if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`
		return date.toLocaleDateString("vi-VN")
	}

	const currentRoom = originalChatRooms.find((r) => r.id === selectedChat)

	return (
		<div className="h-screen flex bg-background">
			{/* Sidebar */}
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
											src={user?.avatar || "/placeholder.png"}
											alt={user?.name || "User"}
										/>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem onClick={handleLogout} className="text-destructive">
									<LogOut className="h-4 w-4 mr-2" />
									Đăng xuất
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
										Tạo phòng chat mới
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
								onClick={() => setSelectedChat(room.id)}
								className={`p-4 cursor-pointer hover:bg-sidebar-accent/10 transition-all duration-200 border-l-2 ${selectedChat === room.id ? "bg-sidebar-accent/20 border-l-sidebar-primary" : "border-l-transparent"
									}`}
							>
								<div className="flex items-center space-x-3">
									<div className="relative">
										<Avatar className="h-12 w-12 ring-2 ring-background">
											<img
												src={room.avatar || "/image-group.jpg"}
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
												<p className="text-xs text-muted-foreground">{room.memberCount} thành viên</p>
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
						))
					)}
				</div>
			</div>

			{/* Main Chat Area */}
			{currentRoom && (
				<div className="flex-1 flex flex-col">
					{/* Chat Header */}
					<div className="p-4 border-b border-border bg-card shadow-sm">
						<div className="flex items-center space-x-3">
							<Avatar className="h-10 w-10 ring-2 ring-background">
								<img src={currentRoom?.avatar || "/placeholder.png"} alt="Avatar" />
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

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
						{messages.length === 0 ? (
							<div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
								<div>
									<div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
										<Users className="h-8 w-8" />
									</div>
									<p className="text-lg font-medium mb-2">Chưa có tin nhắn nào</p>
									<p className="text-sm">Hãy bắt đầu cuộc trò chuyện với {currentRoom?.name}!</p>
								</div>
							</div>
						) : (
							messages.map((msg, index) => {
								const showAvatar =
									!msg.isOwn && (index === 0 || messages[index - 1].sender !== msg.sender || messages[index - 1].isOwn)
								const showSender = !msg.isOwn && showAvatar

								return (
									<div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
										<div
											className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
										>
											{showAvatar && (
												<Avatar className="h-6 w-6 mb-1">
													<img src="/diverse-user-avatars.png" alt={msg.sender} />
												</Avatar>
											)}
											{!msg.isOwn && !showAvatar && <div className="w-6" />}
											<div>
												{showSender && <p className="text-xs text-muted-foreground mb-1 px-1">{msg.sender}</p>}
												<div
													className={`px-4 py-2 rounded-2xl shadow-sm ${msg.isOwn
														? "bg-primary text-primary-foreground rounded-br-md"
														: "bg-card text-card-foreground rounded-bl-md border"
														}`}
												>
													{msg.type === "file" ? (
														<div className="space-y-2">
															<div className="flex items-center space-x-2">
																<Paperclip className="h-4 w-4" />
																<span className="text-sm font-medium">{msg.fileName}</span>
															</div>
															{msg.fileUrl && (
																<a
																	href={msg.fileUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-xs underline opacity-80 hover:opacity-100"
																>
																	Tải xuống
																</a>
															)}
														</div>
													) : (
														<p className="text-sm leading-relaxed">{msg.text}</p>
													)}
													<p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
												</div>
											</div>
										</div>
									</div>
								)
							})
						)}

						{/* Typing Indicator */}
						{isTyping && (
							<div className="flex justify-start">
								<div className="flex items-center space-x-2">
									<Avatar className="h-6 w-6">
										<img src="/typing-user.jpg" alt="Typing" />
									</Avatar>
									<div className="bg-card text-card-foreground px-4 py-2 rounded-2xl border">
										<div className="flex space-x-1">
											<div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
											<div
												className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
												style={{ animationDelay: "0.1s" }}
											></div>
											<div
												className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
												style={{ animationDelay: "0.2s" }}
											></div>
										</div>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* File Upload Area */}
					{showFileUpload && (
						<div className="p-4 border-t border-border bg-muted/50">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">Chia sẻ file</p>
									<Button variant="ghost" size="sm" onClick={() => setShowFileUpload(false)} className="h-6 w-6 p-0">
										×
									</Button>
								</div>
								<FileUpload onFileUploaded={handleFileUpload} />
							</div>
						</div>
					)}

					{/* Message Input */}
					<div className="p-4 border-t border-border bg-card">
						<form onSubmit={handleSendMessage} className="flex space-x-2">
							<div className="flex space-x-1">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setShowFileUpload(!showFileUpload)}
									className="p-2 hover:bg-muted"
								>
									<Paperclip className="h-4 w-4" />
								</Button>
								<Button type="button" variant="ghost" size="sm" className="p-2 hover:bg-muted">
									<Smile className="h-4 w-4" />
								</Button>
							</div>
							<Input
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder={currentRoom ? `Nhập tin nhắn tới ${currentRoom.name}...` : "Chọn phòng chat để bắt đầu..."}
								className="flex-1 rounded-full border-input focus:ring-2 focus:ring-ring"
								disabled={!selectedChat}
							/>
							<Button
								type="submit"
								size="sm"
								className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 transition-all duration-200 hover:scale-105"
								disabled={!message.trim() || !selectedChat}
							>
								<Send className="h-4 w-4" />
							</Button>
						</form>
					</div>
				</div>
			)}

			{/* Create Room Dialog */}
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
		</div>
	)
}
