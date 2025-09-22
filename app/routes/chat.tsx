import { db, pushMessage, roomMessagesRef, roomsRef } from "config/firebase"
import type { EmojiClickData } from 'emoji-picker-react'
import { off, onValue, ref } from "firebase/database"
import { cn } from "lib/utils"
import { Menu, Search, Settings, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { selectUser } from "store/features/slice/useSlice"
import { useAppSelector } from 'store/hooks'
import type { ChatRoom, JoinRequest, Message, SenderInfo } from "types/Chat"
import { getUserByUid } from "util/db"
import { scrollToBottom } from "util/helper"
import { RoomMemberManager } from "util/roomMemberManager"
import CreateRoomDialog from "~/components/chat-page/dialog/create-room"
import ChatHeader from "~/components/chat-page/message/header"
import MainMessage from "~/components/chat-page/message/main-message"
import MessageInput from "~/components/chat-page/message/message-input"
import MessageSearch from "~/components/chat-page/message/message-search"
import ShowFileUpload from "~/components/chat-page/message/show-file-upload"
import TypingIndicator from "~/components/chat-page/message/typing-indicator"
import NotYetMessage from "~/components/chat-page/not-yet-message"
import Sidebar from "~/components/chat-page/sidebar"
import { Button } from "~/components/ui/button"
import { useLogout } from "~/hooks/useAuthState"
import { useResponsive } from "~/hooks/useResponsive"
import { useChatRooms } from "~/hooks/firebase-helper/useChatRooms"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"
import ManageRequestsDialog from "~/components/chat-page/dialog/manage-requests"

export default function Chat() {
	const [message, setMessage] = useState("")
	const [messages, setMessages] = useState<Message[]>([])
	const [originalChatRooms, setOriginalChatRooms] = useState<ChatRoom[]>([])
	const [openDialog, setOpenDialog] = useState(false)
	const [selectedChat, setSelectedChat] = useState("1")
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [roomName, setRoomName] = useState("")
	const [searchRoom, setSearchRoom] = useState("")
	const [isTyping, setIsTyping] = useState(false)
	const [showFileUpload, setShowFileUpload] = useState(false)
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)

	// Message search states
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)

	const navigate = useNavigate()
	const user = useAppSelector(selectUser)
	const [senderInfo, setSenderInfo] = useState<Record<string, SenderInfo>>({})
	const { handleLogout, isLoggingOut } = useLogout()
	const { isMobile, isTablet, isDesktop } = useResponsive()

	// Use our new chat rooms hook with real member counts
	const { chatRooms: allChatRooms, loading: roomsLoading } = useChatRooms()
	const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])

	const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])

	const [openManageDialog, setOpenManageDialog] = useState(false)

	// Check if user is authenticated
	useEffect(() => {
		if (!user?.uid) {
			navigate("/login")
		}
	}, [user, navigate])

	useEffect(() => {
		console.log('Current user from Redux:', user);
	}, [user])

	// Fetch sender info for all unique senders
	useEffect(() => {
		const uniqueSenders = [...new Set(messages.map(msg => msg.sender))]
		uniqueSenders.forEach(senderId => {
			if (senderId && !senderInfo[senderId] && senderId !== user?.uid) {
				handleShowSender(senderId)
			}
		})
	}, [messages, senderInfo, user?.uid])

	// Close emoji picker when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showEmojiPicker && !(event.target as Element).closest('.emoji-picker-container')) {
				setShowEmojiPicker(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showEmojiPicker])

	useEffect(() => {
		scrollToBottom(messagesEndRef as React.RefObject<HTMLDivElement>)
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

	// Update chat rooms from hook
	useEffect(() => {
		setChatRooms(allChatRooms)
		setOriginalChatRooms(allChatRooms)

		// Set first room as selected if none selected
		if (allChatRooms.length > 0 && !selectedChat) {
			setSelectedChat(allChatRooms[0].id)
		}
	}, [allChatRooms, selectedChat])

	// Set online status when user selects a room they're already a member of
	useEffect(() => {
		if (selectedChat && user?.uid) {
			// Only set online status, don't auto-join
			RoomMemberManager.setOnlineStatus(selectedChat, user.uid, true)

			// Cleanup on unmount or room change
			return () => {
				if (selectedChat && user?.uid) {
					RoomMemberManager.setOnlineStatus(selectedChat, user.uid, false)
				}
			}
		}
	}, [selectedChat, user?.uid])

	useEffect(() => {
		if (!selectedChat) return

		const messagesListener = onValue(roomMessagesRef(selectedChat), (snapshot) => {
			const data = snapshot.val()
			if (data) {
				const msgs: Message[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
					id,
					text: msg.text || msg.content || "",
					sender: msg.sender || msg.user || user?.uid,
					timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
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
				sender: user?.displayName || user?.uid || "Anonymous",
				timestamp: Date.now(),
				isOwn: true,
				type: "text",
			})
			setMessage("")
		} catch (error) {
			console.error("Error sending message:", error)
		}
	}

	const handleFileUpload = async (fileUrl: string, fileName: string, fileType: string) => {
		if (!selectedChat) return

		try {
			// Create appropriate message based on file type
			let messageText = `📎 ${fileName}`
			if (fileType === 'image') messageText = `🖼️ Image: ${fileName}`
			else if (fileType === 'video') messageText = `🎥 Video: ${fileName}`
			else if (fileType === 'document') messageText = `📄 Document: ${fileName}`

			await pushMessage(selectedChat, {
				text: messageText,
				sender: user?.displayName || user?.uid || "Anonymous",
				timestamp: Date.now(),
				isOwn: true,
				type: "file",
				fileUrl,
				fileName,
				fileType,
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

	const handleEmojiClick = (emojiData: EmojiClickData) => {
		setMessage(prev => prev + emojiData.emoji)
		setShowEmojiPicker(false)
	}

	// 🔍 Search functions
	const handleSearchToggle = () => {
		setIsSearchOpen(!isSearchOpen)
		if (isSearchOpen) {
			// Clear search when closing
			setSearchQuery('')
			setHighlightedMessageId(null)
		}
	}

	const handleSearchResultClick = (messageId: string) => {
		setHighlightedMessageId(messageId)
		// Scroll to message
		const messageElement = document.getElementById(`message-${messageId}`)
		if (messageElement) {
			messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}

	const currentRoom = originalChatRooms.find((r) => r.id === selectedChat)

	const handleShowSender = async (senderId: string) => {
		try {
			// Check if we already have this sender's info
			if (senderInfo[senderId]) {
				return senderInfo[senderId]
			}

			const userData = await getUserByUid(senderId)
			if (userData) {
				setSenderInfo(prev => ({
					...prev,
					[senderId]: userData
				}))
				return userData as SenderInfo
			}
		} catch (error) {
			console.error("Error getting user data:", error)
		}
	}

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
	}, [currentRoom?.id, user?.uid])

	const isAdminOfSelectedRoom = () => {
		if (!currentRoom || !user?.uid) return false
		return currentRoom?.members?.[user.uid]?.role === 'admin'
	}

	return (
		<div className="h-screen flex bg-background relative touch-device">
			{/* Mobile Navigation Bar */}
			{isMobile && (
				<div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border lg:hidden pt-safe">
					<div className="flex items-center justify-between p-4 tap-target">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsSidebarOpen(true)}
							className="p-2 tap-target touch-feedback"
						>
							<Menu className="h-5 w-5" />
						</Button>
						<h1 className="text-lg font-semibold text-foreground truncate max-w-screen">
							{currentRoom?.name || "Chat"}
						</h1>
						<div className="w-9" /> {/* Spacer for centering */}
						<div className="flex items-center gap-2">
							{/* Search Button */}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={isSearchOpen ? "default" : "outline"}
										size="sm"
										onClick={handleSearchToggle}
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
				</div>
			)}

			{/* Sidebar */}
			<Sidebar
				user={user}
				chatRooms={chatRooms}
				selectedChat={selectedChat}
				setSelectedChat={setSelectedChat}
				handleCreateRoom={handleCreateRoom}
				handleLogout={handleLogout}
				isLoggingOut={isLoggingOut}
				handleSearchRoom={handleSearchRoom}
				searchRoom={searchRoom}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			{/* Main Chat Area */}
			{currentRoom && (
				<div className={cn(
					"relative flex-1 flex flex-col max-w-screen-mobile overflow-hidden",
					// Add top padding on mobile for navigation bar
					isMobile && "pt-16"
				)}>
					{/* Chat Header */}
					{!isMobile && (
						<ChatHeader onSearchToggle={handleSearchToggle} isSearchOpen={isSearchOpen} currentRoom={currentRoom} />
					)}

					{/* Message Search */}
					<MessageSearch
						messages={messages}
						onSearchResultClick={handleSearchResultClick}
						onClose={handleSearchToggle}
						isOpen={isSearchOpen}
					/>

					{/* Messages */}
					<div className={cn(
						"flex-1 p-4 space-y-4 overflow-y-auto scroll bg-muted/20 smooth-scroll hide-scrollbar",
						isSearchOpen && "pt-20" // Add padding when search is open
					)}>
						{messages.length === 0 ? (
							<NotYetMessage currentRoom={currentRoom} />
						) : (
							messages.map((msg, index) => (
								<MainMessage
									key={msg.id}
									msg={msg}
									index={index}
									messages={messages}
									senderInfo={senderInfo}
									searchQuery={searchQuery}
									highlightedMessageId={highlightedMessageId}
								/>
							))
						)}

						{/* Typing Indicator */}
						{isTyping && (
							<TypingIndicator />
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* File Upload Area */}
					{showFileUpload && (
						<ShowFileUpload handleFileUpload={handleFileUpload} setShowFileUpload={setShowFileUpload} />
					)}

					{/* Message Input */}
					<MessageInput
						message={message}
						setMessage={setMessage}
						handleSendMessage={handleSendMessage}
						selectedChat={selectedChat}
						currentRoom={currentRoom}
						showEmojiPicker={showEmojiPicker}
						setShowEmojiPicker={setShowEmojiPicker}
						showFileUpload={showFileUpload}
						setShowFileUpload={setShowFileUpload}
						handleEmojiClick={handleEmojiClick}
					/>

					<ManageRequestsDialog
						openDialog={openManageDialog}
						setOpenDialog={setOpenManageDialog}
						roomId={currentRoom.id}
					/>
				</div>
			)}

			{/* Create Room Dialog */}
			<CreateRoomDialog
				openDialog={openDialog}
				setOpenDialog={setOpenDialog}
				setSelectedChat={setSelectedChat}
				roomName={roomName}
				setRoomName={setRoomName}
			/>


		</div>
	)
}
