import { File, Image, Video } from 'lucide-react'
import { useAppSelector } from 'store/hooks'
import type { Message } from 'types/Chat'
import { Avatar } from '~/components/ui/avatar'
import { formatTime, handleCheckIsOwn } from 'util/helper'

interface MainMessageProps {
	index: number
	messages: Array<Message>
	senderInfo: Record<string, { email?: string }>
	msg: Message
}

function MainMessage({ msg, index, messages, senderInfo }: MainMessageProps) {
	const user = useAppSelector((state) => state.user)
	const showAvatar =
		!handleCheckIsOwn(msg.sender, user) && (index === 0 || messages[index - 1].sender !== msg.sender)
	const showSender = !handleCheckIsOwn(msg.sender, user) && showAvatar

	return (
		<div key={msg.id} className={`flex ${handleCheckIsOwn(msg.sender, user) ? "justify-end" : "justify-start"}`}>
			<div
				className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${handleCheckIsOwn(msg.sender, user) ? "flex-row" : ""} ${handleCheckIsOwn(msg.sender, user) ? "flex-row-reverse space-x-reverse" : ""}`}
			>
				{showAvatar && (
					<Avatar className="h-6 w-6 mb-1">
						<img src="https://as1.ftcdn.net/v2/jpg/01/23/70/50/1000_F_123705006_WKLP8VkLmggtDSVZV3cQBR5ltYkifWP2.jpg" alt={msg.sender} />
					</Avatar>
				)}
				{!handleCheckIsOwn(msg.sender, user) && !showAvatar && <div className="w-6" />}
				<div>
					{showSender && (
						<p className="text-xs text-muted-foreground mb-1 px-1">
							{"@" + senderInfo[msg.sender]?.email?.split("@")[0] || msg.sender}
						</p>
					)}
					<div
						className={`px-4 py-2 rounded-2xl shadow-sm ${handleCheckIsOwn(msg.sender, user)
							? "bg-primary text-primary-foreground rounded-br-md"
							: "bg-card text-card-foreground rounded-bl-md border"
							}`}
					>
						{msg.type === "file" ? (
							<div className="space-y-2 max-w-xs">
								{/* Image Preview */}
								{msg.fileType === 'image' && msg.fileUrl && (
									<div className="rounded-lg overflow-hidden border bg-muted/30">
										<img
											src={msg.fileUrl}
											alt={msg.fileName || "Image"}
											className="w-full max-w-48 h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
											onClick={() => window.open(msg.fileUrl, '_blank')}
										/>
									</div>
								)}

								{/* File Info */}
								<div className="flex items-center space-x-2">
									{msg.fileType === 'image' && <Image className="h-4 w-4 text-blue-500" />}
									{msg.fileType === 'video' && <Video className="h-4 w-4 text-purple-500" />}
									{(!msg.fileType || msg.fileType === 'other' || msg.fileType === 'document') && <File className="h-4 w-4 text-gray-500" />}
									<div className="flex-1 min-w-0">
										<span className="text-sm font-medium truncate block">{msg.fileName}</span>
										{msg.fileType && (
											<span className="text-xs opacity-70 capitalize">{msg.fileType}</span>
										)}
									</div>
								</div>

								{/* Download Link */}
								{msg.fileUrl && (
									<a
										href={msg.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-xs underline opacity-80 hover:opacity-100 transition-opacity"
									>
										{msg.fileType === 'image' ? 'View original' : 'Download'}
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
}

export default MainMessage
