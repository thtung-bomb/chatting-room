import type { UserState } from "store/features/slice/useSlice"

export const handleCheckIsOwn = (msgSender: string, user?: UserState) => {
	return msgSender === user?.displayName || msgSender === user?.uid || msgSender === "Anonymous"
}

export const formatTime = (date: Date) => {
	return date.toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
	})
}

export const formatLastSeen = (date: Date) => {
	const now = new Date()
	const diff = now.getTime() - date.getTime()
	const minutes = Math.floor(diff / 60000)

	if (minutes < 1) return "now"
	if (minutes < 60) return `${minutes} minutes ago`
	if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`
	return date.toLocaleDateString("vi-VN")
}

export const scrollToBottom = (messagesEndRef: React.RefObject<HTMLDivElement>) => {
	messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}
