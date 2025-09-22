import { File, Image, Video } from 'lucide-react'
import { useAppSelector } from 'store/hooks'
import type { Message } from 'types/Chat'
import { Avatar } from '~/components/ui/avatar'
import { formatTime, handleCheckIsOwn } from 'util/helper'
import { useResponsive } from '~/hooks/useResponsive'
import { useMessageHighlight } from '~/hooks/useMessageHighlight'
import { cn } from 'lib/utils'

interface MainMessageProps {
	index: number
	messages: Array<Message>
	senderInfo: Record<string, { email?: string }>
	msg: Message
	searchQuery?: string
	highlightedMessageId?: string | null
}

function MainMessage({ msg, index, messages, senderInfo, searchQuery = '', highlightedMessageId }: MainMessageProps) {
	const user = useAppSelector((state) => state.user)
	const { isMobile, isTablet } = useResponsive()
	const showAvatar =
		!handleCheckIsOwn(msg.sender, user) && (index === 0 || messages[index - 1].sender !== msg.sender)
	const showSender = !handleCheckIsOwn(msg.sender, user) && showAvatar
	const isOwn = handleCheckIsOwn(msg.sender, user)

	// Use message highlight hook
	const { highlightedText, messageClassName } = useMessageHighlight({
		text: msg.text,
		searchQuery,
		isHighlighted: highlightedMessageId === msg.id
	})

	return (
		<div key={msg.id} className={cn(
			"flex",
			isOwn ? "justify-end" : "justify-start",
			messageClassName // Add highlight styling
		)}
			id={`message-${msg.id}`} // Add ID for scrolling
		>
			<div className={cn(
				"flex items-end space-x-2",
				isMobile
					? "max-w-[280px]"
					: isTablet
						? "max-w-sm"
						: "max-w-xs lg:max-w-md",
				isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
			)}>
				{showAvatar && (
					<Avatar className={cn(
						"mb-1 flex-shrink-0",
						// Mobile: Slightly smaller avatars
						isMobile ? "h-5 w-5" : "h-6 w-6"
					)}>
						<img
							src="https://as1.ftcdn.net/v2/jpg/01/23/70/50/1000_F_123705006_WKLP8VkLmggtDSVZV3cQBR5ltYkifWP2.jpg"
							alt={msg.sender}
							className="object-cover"
						/>
					</Avatar>
				)}
				{!isOwn && !showAvatar && (
					<div className={cn(
						isMobile ? "w-5" : "w-6"
					)} />
				)}
				<div className="flex-1 min-w-0">
					{showSender && (
						<p className={cn(
							"text-muted-foreground mb-1 px-1 truncate",
							// Mobile: Smaller sender text
							isMobile ? "text-xs" : "text-xs"
						)}>
							{"@" + senderInfo[msg.sender]?.email?.split("@")[0] || msg.sender}
						</p>
					)}
					<div className={cn(
						"shadow-sm",
						// Mobile: More touch-friendly padding and sizing
						isMobile ? "px-3 py-2" : "px-4 py-2",
						isOwn
							? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
							: "bg-card text-card-foreground rounded-2xl rounded-bl-md border"
					)}>
						{msg.type === "file" ? (
							<div className={cn(
								"space-y-2",
								// Mobile: Better file preview sizing
								isMobile ? "max-w-[240px]" : "max-w-xs"
							)}>
								{/* Image Preview */}
								{msg.fileType === 'image' && msg.fileUrl && (
									<div className="rounded-lg overflow-hidden border bg-muted/30">
										<img
											src={msg.fileUrl}
											alt={msg.fileName || "Image"}
											className={cn(
												"w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity",
												// Mobile: Better image sizing
												isMobile ? "max-w-[240px]" : "max-w-48"
											)}
											onClick={() => window.open(msg.fileUrl, '_blank')}
										/>
									</div>
								)}

								{/* File Info */}
								<div className="flex items-center space-x-2">
									{msg.fileType === 'image' && <Image className="h-4 w-4 text-blue-500 flex-shrink-0" />}
									{msg.fileType === 'video' && <Video className="h-4 w-4 text-purple-500 flex-shrink-0" />}
									{(!msg.fileType || msg.fileType === 'other' || msg.fileType === 'document') && <File className="h-4 w-4 text-gray-500 flex-shrink-0" />}
									<div className="flex-1 min-w-0">
										<span className={cn(
											"font-medium truncate block",
											isMobile ? "text-xs" : "text-sm"
										)}>
											{msg.fileName}
										</span>
										{msg.fileType && (
											<span className={cn(
												"opacity-70 capitalize",
												isMobile ? "text-xs" : "text-xs"
											)}>
												{msg.fileType}
											</span>
										)}
									</div>
								</div>

								{/* Download Link */}
								{msg.fileUrl && (
									<a
										href={msg.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className={cn(
											"inline-flex items-center underline opacity-80 hover:opacity-100 transition-opacity",
											isMobile ? "text-xs" : "text-xs"
										)}
									>
										{msg.fileType === 'image' ? 'View original' : 'Download'}
									</a>
								)}
							</div>
						) : (
							<p className={cn(
								"leading-relaxed break-words",
								// Mobile: Better text sizing and line height
								isMobile ? "text-sm leading-5" : "text-sm leading-relaxed"
							)}
								dangerouslySetInnerHTML={{ __html: highlightedText }} // Use highlighted text
							/>
						)}
						<p className={cn(
							"opacity-70 mt-1",
							// Mobile: Smaller timestamp
							isMobile ? "text-xs" : "text-xs"
						)}>
							{formatTime(msg.timestamp)}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MainMessage
