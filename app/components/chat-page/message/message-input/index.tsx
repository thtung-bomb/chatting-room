import EmojiPicker from 'emoji-picker-react'
import { Paperclip, Send, Smile } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useResponsive } from '~/hooks/useResponsive'
import { cn } from 'lib/utils'

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
	const { isMobile, isTablet, isDesktop } = useResponsive()

	return (
		<div className={cn(
			"border-t border-border bg-card",
			// Mobile: More padding on sides, less on top/bottom
			isMobile ? "p-3" : "p-4",
			// Safe area for mobile keyboards
			isMobile && "pb-safe-bottom"
		)}>
			<form onSubmit={handleSendMessage} className={cn(
				"flex items-end",
				// Mobile: Closer spacing
				isMobile ? "space-x-1" : "space-x-2"
			)}>
				<div className={cn(
					"flex",
					// Mobile: Vertical button layout for better touch
					isMobile ? "flex-col space-y-1" : "space-x-1"
				)}>
					<Button
						type="button"
						variant="ghost"
						size={isMobile ? "sm" : "sm"}
						onClick={() => setShowFileUpload(!showFileUpload)}
						className={cn(
							"hover:bg-muted",
							// Mobile: Bigger touch targets
							isMobile ? "p-3 h-9 w-9" : "p-2"
						)}
					>
						<Paperclip className="h-4 w-4" />
					</Button>
					<div className="relative emoji-picker-container">
						<Button
							type="button"
							variant="ghost"
							size={isMobile ? "sm" : "sm"}
							onClick={() => setShowEmojiPicker(!showEmojiPicker)}
							className={cn(
								"hover:bg-muted",
								// Mobile: Bigger touch targets
								isMobile ? "p-3 h-9 w-9" : "p-2"
							)}
						>
							<Smile className="h-4 w-4" />
						</Button>
						{showEmojiPicker && (
							<div className={cn(
								"absolute z-50",
								// Mobile: Better positioning for emoji picker
								isMobile
									? "bottom-12 right-0 transform -translate-x-1/2"
									: "bottom-12 left-0"
							)}>
								<EmojiPicker
									onEmojiClick={handleEmojiClick}
									width={isMobile ? 280 : 320}
									height={isMobile ? 350 : 400}
								/>
							</div>
						)}
					</div>
				</div>
				<Input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder={currentRoom ? `Nhập tin nhắn tới ${currentRoom.name}...` : "Chọn phòng chat để bắt đầu..."}
					className={cn(
						"flex-1 border-input focus:ring-2 focus:ring-ring",
						// Mobile: Larger input with better touch target
						isMobile
							? "rounded-2xl h-10 text-base"
							: "rounded-full"
					)}
					disabled={!selectedChat}
				/>
				<Button
					type="submit"
					size={isMobile ? "default" : "sm"}
					className={cn(
						"bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105",
						// Mobile: Larger send button, less rounded
						isMobile
							? "rounded-2xl px-4 py-2 h-10 min-w-[60px]"
							: "rounded-full px-4"
					)}
					disabled={!message.trim() || !selectedChat}
				>
					<Send className="h-4 w-4" />
					{isMobile && message.trim() && (
						<span className="ml-2 text-sm font-medium">Send</span>
					)}
				</Button>
			</form>
		</div>
	)
}

export default MessageInput
