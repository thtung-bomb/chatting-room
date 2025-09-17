import type React from "react"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { uploadFile, getFileUrl } from "config/supabase"
import { Upload, File, X } from "lucide-react"

interface FileUploadProps {
	onFileUploaded?: (url: string) => void
	bucket?: string
	accept?: string
}

export function FileUpload({ onFileUploaded, bucket = "chat-files", accept = "*" }: FileUploadProps) {
	const [uploading, setUploading] = useState(false)
	const [uploadedUrl, setUploadedUrl] = useState<string>("")
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setSelectedFile(file)
		}
	}

	const handleFileUpload = async () => {
		if (!selectedFile) return

		setUploading(true)
		try {
			const fileName = `${Date.now()}-${selectedFile.name}`
			await uploadFile(selectedFile, bucket, fileName)
			const url = getFileUrl(bucket, fileName)

			setUploadedUrl(url)
			onFileUploaded?.(url)
			setSelectedFile(null)
		} catch (error) {
			console.error("Error uploading file:", error)
			alert("Lỗi khi tải file lên")
		} finally {
			setUploading(false)
		}
	}

	const clearSelection = () => {
		setSelectedFile(null)
		setUploadedUrl("")
	}

	return (
		<div className="space-y-3">
			{!selectedFile ? (
				<div className="flex items-center space-x-2">
					<div className="relative flex-1">
						<Input type="file" accept={accept} onChange={handleFileSelect} className="hidden" id="file-input" />
						<label
							htmlFor="file-input"
							className="flex items-center justify-center w-full p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 cursor-pointer transition-colors"
						>
							<Upload className="h-5 w-5 mr-2 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Chọn file để chia sẻ</span>
						</label>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
						<div className="flex items-center space-x-2">
							<File className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium truncate">{selectedFile.name}</span>
							<span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
						</div>
						<Button variant="ghost" size="sm" onClick={clearSelection} className="h-6 w-6 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
					<div className="flex space-x-2">
						<Button onClick={handleFileUpload} disabled={uploading} className="flex-1" size="sm">
							{uploading ? (
								<div className="flex items-center">
									<div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
									Đang tải lên...
								</div>
							) : (
								"Gửi file"
							)}
						</Button>
						<Button variant="outline" onClick={clearSelection} size="sm">
							Hủy
						</Button>
					</div>
				</div>
			)}

			{uploadedUrl && (
				<div className="p-2 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-sm text-green-800">File đã được tải lên thành công!</p>
					<a
						href={uploadedUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-green-600 hover:underline"
					>
						Xem file
					</a>
				</div>
			)}
		</div>
	)
}
