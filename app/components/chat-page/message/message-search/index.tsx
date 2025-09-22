import { useState, useEffect } from 'react'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { cn } from 'lib/utils'
import type { Message } from 'types/Chat'

interface MessageSearchProps {
	messages: Message[]
	onSearchResultClick: (messageId: string) => void
	onClose: () => void
	isOpen: boolean
}

function MessageSearch({ messages, onSearchResultClick, onClose, isOpen }: MessageSearchProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<Message[]>([])
	const [currentResultIndex, setCurrentResultIndex] = useState(-1)
	const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)

	// Tìm kiếm tin nhắn
	const searchMessages = (query: string) => {
		if (!query.trim()) {
			setSearchResults([])
			setCurrentResultIndex(-1)
			setHighlightedMessageId(null)
			return
		}

		const results = messages.filter(message =>
			message.text.toLowerCase().includes(query.toLowerCase())
		).reverse() // Newest first

		setSearchResults(results)
		setCurrentResultIndex(results.length > 0 ? 0 : -1)

		if (results.length > 0) {
			setHighlightedMessageId(results[0].id)
			onSearchResultClick(results[0].id)
		} else {
			setHighlightedMessageId(null)
		}
	}

	// ⬆️ Kết quả trước
	const goToPrevious = () => {
		if (searchResults.length === 0) return

		const newIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1
		setCurrentResultIndex(newIndex)
		setHighlightedMessageId(searchResults[newIndex].id)
		onSearchResultClick(searchResults[newIndex].id)
	}

	// ⬇️ Kết quả tiếp theo
	const goToNext = () => {
		if (searchResults.length === 0) return

		const newIndex = currentResultIndex === searchResults.length - 1 ? 0 : currentResultIndex + 1
		setCurrentResultIndex(newIndex)
		setHighlightedMessageId(searchResults[newIndex].id)
		onSearchResultClick(searchResults[newIndex].id)
	}

	// Handle search input
	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			searchMessages(searchQuery)
		}, 300) // Debounce 300ms

		return () => clearTimeout(debounceTimer)
	}, [searchQuery, messages])

	// Reset when closed
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('')
			setSearchResults([])
			setCurrentResultIndex(-1)
			setHighlightedMessageId(null)
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className="absolute top-16 left-0 right-0 z-50 bg-background border-b shadow-lg">
			<div className="flex items-center gap-2 p-3">
				{/* Search Icon */}
				<Search className="h-4 w-4 text-muted-foreground" />

				{/* Search Input */}
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search messages..."
					className="flex-1 border-none shadow-none focus:ring-0"
					autoFocus
				/>

				{/* Results Count */}
				{searchResults.length > 0 && (
					<Badge variant="secondary" className="text-xs">
						{currentResultIndex + 1} of {searchResults.length}
					</Badge>
				)}

				{/* Navigation Buttons */}
				{searchResults.length > 0 && (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={goToNext}
							className="p-1 h-8 w-8"
						>
							<ChevronUp className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={goToPrevious}
							className="p-1 h-8 w-8"
						>
							<ChevronDown className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Close Button */}
				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					className="p-1 h-8 w-8"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{/* No Results */}
			{searchQuery.trim() && searchResults.length === 0 && (
				<div className="px-3 pb-2">
					<p className="text-sm text-muted-foreground">No messages found</p>
				</div>
			)}
		</div>
	)
}

export default MessageSearch