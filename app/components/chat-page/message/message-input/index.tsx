import EmojiPicker from 'emoji-picker-react'
import { Paperclip, Send, Smile } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

interface MessageInputProps {
	message: string
	setMessage: (msg: string) => void
	handleSendMessage: (e: React.FormEvent) => void
	selectedChat: string | null
	currentRoom: { id: string; name: string } | null
	showEmojiPicker: boolean
	setShowEmojiPicker: (show: boolean) => void
	showFileUpload: boolean
	setShowFileUpload: (show: boolean) => void
	handleEmojiClick: (emojiData: any, event: MouseEvent) => void
}

function MessageInput({
	message,
	setMessage,
	handleSendMessage,
	selectedChat,
	currentRoom,
	showEmojiPicker,
	setShowEmojiPicker,
	showFileUpload,
	setShowFileUpload,
	handleEmojiClick
}: MessageInputProps) {
	return (
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
					<div className="relative emoji-picker-container">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowEmojiPicker(!showEmojiPicker)}
							className="p-2 hover:bg-muted"
						>
							<Smile className="h-4 w-4" />
						</Button>
						{showEmojiPicker && (
							<div className="absolute bottom-12 left-0 z-50">
								<EmojiPicker onEmojiClick={handleEmojiClick} />
							</div>
						)}
					</div>
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
	)
}

export default MessageInput
