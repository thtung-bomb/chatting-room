import { pushMessage, roomMessagesRef, roomsRef } from "config/firebase"
import type { EmojiClickData } from 'emoji-picker-react'
import { off, onValue } from "firebase/database"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useLogout } from "~/hooks/useAuthState"
import { selectUser, type UserState } from "store/features/slice/useSlice"
import { useAppSelector } from 'store/hooks'
import type { ChatRoom, Message, SenderInfo } from "types/Chat"
import { getUserByUid } from "util/db"
import CreateRoomDialog from "~/components/chat-page/dialog/create-room"
import ChatHeader from "~/components/chat-page/message/header"
import MainMessage from "~/components/chat-page/message/main-message"
import MessageInput from "~/components/chat-page/message/message-input"
import ShowFileUpload from "~/components/chat-page/message/show-file-upload"
import TypingIndicator from "~/components/chat-page/message/typing-indicator"
import NotYetMessage from "~/components/chat-page/not-yet-message"
import Sidebar from "~/components/chat-page/sidebar"
import { scrollToBottom } from "util/helper"

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
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const navigate = useNavigate()
	const user = useAppSelector(selectUser)
	const [senderInfo, setSenderInfo] = useState<Record<string, SenderInfo>>({})
	const { handleLogout, isLoggingOut } = useLogout()

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

	useEffect(() => {
		// Listen to rooms
		const roomsListener = onValue(roomsRef(), (snapshot) => {
			const data = snapshot.val()
			if (data) {
				const rooms: ChatRoom[] = Object.entries(data).map(([id, room]: [string, any]) => ({
					id,
					name: room.meta?.name || "Unknown Room",
					lastMessage: "New message",
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
			console.error("Error fetching user by uid:", error)
		}
		return null
	}

	return (
		<div className="h-screen flex bg-background">
			{/* Sidebar */}
			<Sidebar user={user} chatRooms={chatRooms} selectedChat={selectedChat} setSelectedChat={setSelectedChat} handleCreateRoom={handleCreateRoom} handleLogout={handleLogout} isLoggingOut={isLoggingOut} handleSearchRoom={handleSearchRoom} searchRoom={searchRoom} />
			{/* Main Chat Area */}
			{currentRoom && (
				<div className="flex-1 flex flex-col">
					{/* Chat Header */}
					<ChatHeader currentRoom={currentRoom} />

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
						{messages.length === 0 ? (
							<NotYetMessage currentRoom={currentRoom} />
						) : (
							messages.map((msg, index) => (
								<MainMessage key={msg.id} msg={msg} index={index} messages={messages} senderInfo={senderInfo} />
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
				</div>
			)}

			{/* Create Room Dialog */}
			<CreateRoomDialog openDialog={openDialog} setOpenDialog={setOpenDialog} setSelectedChat={setSelectedChat} roomName={roomName} setRoomName={setRoomName} />
		</div>
	)
}
