import { useMemo } from 'react'

interface UseMessageHighlightProps {
	text: string
	searchQuery: string
	isHighlighted: boolean
}

export function useMessageHighlight({ text, searchQuery, isHighlighted }: UseMessageHighlightProps) {
	const highlightedText = useMemo(() => {
		if (!searchQuery.trim() || !text) return text

		// Simple text highlighting without JSX
		return text.replace(
			new RegExp(`(${searchQuery})`, 'gi'),
			'<mark class="bg-yellow-200 dark:bg-yellow-600 rounded px-1">$1</mark>'
		)
	}, [text, searchQuery])

	const messageClassName = useMemo(() => {
		if (isHighlighted) {
			return "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20 transition-all duration-300"
		}
		return ""
	}, [isHighlighted])

	return { highlightedText, messageClassName }
}