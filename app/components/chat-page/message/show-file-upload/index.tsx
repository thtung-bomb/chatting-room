import { X } from 'lucide-react'
import React from 'react'
import { FileUpload } from '~/components/file-upload'
import { Button } from '~/components/ui/button'

interface ShowFileUploadProps {
	setShowFileUpload: (show: boolean) => void
	handleFileUpload: (fileUrl: string, fileName: string, fileType: string) => Promise<void>
}

function ShowFileUpload({ setShowFileUpload, handleFileUpload }: ShowFileUploadProps) {
	return (
		<div className="p-4 border-t border-border bg-muted/50">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium">Share File</p>
					<Button variant="ghost" size="sm" onClick={() => setShowFileUpload(false)} className="h-6 w-6 p-0">
						<X className="h-4 w-4" />
					</Button>
				</div>
				<FileUpload onFileUploaded={handleFileUpload} />
			</div>
		</div>
	)
}

export default ShowFileUpload
