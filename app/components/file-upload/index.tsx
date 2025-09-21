import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { uploadFile, getFileUrl } from "config/supabase"
import { Upload, File, X, AlertTriangle, Image, Video } from "lucide-react"

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = {
	image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
	video: ['video/mp4', 'video/webm', 'video/quicktime'],
	document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	other: ['application/zip', 'application/x-rar-compressed']
}

interface FileValidation {
	isValid: boolean
	error?: string
	type?: 'image' | 'video' | 'document' | 'other'
}

interface FileUploadProps {
	onFileUploaded?: (url: string, fileName: string, fileType: string) => void
	bucket?: string
	accept?: string
	maxSize?: number
}

export function FileUpload({
	onFileUploaded,
	bucket = "dudaji-files",
	accept = "*",
	maxSize = MAX_FILE_SIZE
}: FileUploadProps) {
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [uploadedUrl, setUploadedUrl] = useState<string>("")
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string>("")
	const [validation, setValidation] = useState<FileValidation>({ isValid: true })
	const [isDragOver, setIsDragOver] = useState(false)
	const [retryCount, setRetryCount] = useState(0)
	const [uploadError, setUploadError] = useState<string>("")
	const fileInputRef = useRef<HTMLInputElement>(null)

	// File validation function
	const validateFile = useCallback((file: File): FileValidation => {
		// Size validation
		if (file.size > maxSize) {
			return {
				isValid: false,
				error: `File too large. Maximum ${(maxSize / 1024 / 1024).toFixed(1)}MB`
			}
		}

		// Type validation
		const allAllowedTypes = [
			...ALLOWED_TYPES.image,
			...ALLOWED_TYPES.video,
			...ALLOWED_TYPES.document,
			...ALLOWED_TYPES.other
		]

		if (!allAllowedTypes.includes(file.type)) {
			return {
				isValid: false,
				error: "File type not supported"
			}
		}

		// Determine file type category
		let fileType: 'image' | 'video' | 'document' | 'other' = 'other'
		if (ALLOWED_TYPES.image.includes(file.type)) fileType = 'image'
		else if (ALLOWED_TYPES.video.includes(file.type)) fileType = 'video'
		else if (ALLOWED_TYPES.document.includes(file.type)) fileType = 'document'

		return { isValid: true, type: fileType }
	}, [maxSize])

	// Create preview for images
	const createPreview = useCallback((file: File) => {
		if (file.type.startsWith('image/')) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)
			return () => URL.revokeObjectURL(url)
		}
		return undefined
	}, [])

	// Handle drag events
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(false)
	}, [])

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragOver(false)

		const files = Array.from(e.dataTransfer.files)
		if (files.length > 0) {
			processFileSelection(files[0])
		}
	}, [])

	const processFileSelection = useCallback((file: File) => {
		const validationResult = validateFile(file)
		setValidation(validationResult)

		if (validationResult.isValid) {
			setSelectedFile(file)
			const cleanup = createPreview(file)
			return cleanup
		}
	}, [validateFile, createPreview])

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			processFileSelection(file)
		}
	}

	// Enhanced upload with retry logic
	const uploadWithRetry = async (file: File, fileName: string, attempt: number = 1): Promise<string> => {
		const maxRetries = 3

		try {
			await uploadFile(file, bucket, fileName)
			return getFileUrl(bucket, fileName)
		} catch (error) {
			console.error(`Upload attempt ${attempt} failed:`, error)

			// Handle specific error cases
			const errorMessage = error instanceof Error ? error.message : String(error)

			// RLS Policy errors - don't retry
			if (errorMessage.includes('row-level security policy') || errorMessage.includes('Không có quyền upload')) {
				throw new Error('Error Authorize: You don’t have permission to upload file. Please check Storage Policy in Supabase.')
			}

			// Bucket not found - don't retry
			if (errorMessage.includes('Bucket not found') || errorMessage.includes('không tồn tại')) {
				throw new Error(`Error uploading file to Storage: Bucket '${bucket}' is not exist. Please create new bucket in Storage Dashboard.`)
			}

			// File type/size errors - don't retry
			if (errorMessage.includes('Invalid file type') || errorMessage.includes('File too large')) {
				throw new Error(`Error uploading file to Storage: ${errorMessage}`)
			}

			// Network/temporary errors - can retry
			if (attempt < maxRetries && !errorMessage.includes('❌')) {
				setUploadError(`Retrying attempt ${attempt}...`)
				await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
				return uploadWithRetry(file, fileName, attempt + 1)
			}

			throw new Error(`Error uploading file to Storage: Upload failed after ${maxRetries} attempts: ${errorMessage}`)
		}
	}

	const handleFileUpload = async () => {
		if (!selectedFile || !validation.isValid) return

		setUploading(true)
		setUploadProgress(0)
		setUploadError("")
		setRetryCount(0)

		try {
			const fileName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => {
					const next = prev + Math.random() * 15 + 5 // Random progress increment
					if (next >= 90) clearInterval(progressInterval)
					return Math.min(next, 90)
				})
			}, 200)

			const url = await uploadWithRetry(selectedFile, fileName)

			setUploadProgress(100)
			setUploadedUrl(url)

			// Call callback with enhanced parameters
			onFileUploaded?.(url, selectedFile.name, validation.type || 'other')

			// Clear state after successful upload
			setTimeout(() => {
				setSelectedFile(null)
				setPreviewUrl("")
				setUploadProgress(0)
				setUploadError("")
			}, 2000)

		} catch (error) {
			console.error("Error uploading file:", error)
			setUploadError(error instanceof Error ? error.message : "Error unknown.")
			setValidation({
				isValid: false,
				error: "Upload failed. Please try again."
			})
		} finally {
			setUploading(false)
		}
	}

	const clearSelection = () => {
		setSelectedFile(null)
		setUploadedUrl("")
		setPreviewUrl("")
		setValidation({ isValid: true })
		setUploadProgress(0)
		setUploadError("")
		setRetryCount(0)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const getFileIcon = (fileType?: string) => {
		if (!fileType) return <File className="h-5 w-5" />

		switch (validation.type) {
			case 'image': return <Image className="h-5 w-5 text-blue-500" />
			case 'video': return <Video className="h-5 w-5 text-purple-500" />
			default: return <File className="h-5 w-5 text-gray-500" />
		}
	}

	return (
		<div className="space-y-3">
			{/* Error Display */}
			{!validation.isValid && (
				<div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
					<AlertTriangle className="h-4 w-4 text-red-500" />
					<span className="text-sm text-red-700">{validation.error}</span>
				</div>
			)}

			{!selectedFile ? (
				<div className="flex items-center space-x-2">
					<div className="relative flex-1">
						<Input
							ref={fileInputRef}
							type="file"
							accept={accept}
							onChange={handleFileSelect}
							className="hidden"
							id="file-input"
						/>
						<label
							htmlFor="file-input"
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isDragOver
								? "border-blue-500 bg-blue-50"
								: "border-muted-foreground/25 hover:border-muted-foreground/50"
								}`}
						>
							<div className="text-center">
								<Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? "text-blue-500" : "text-muted-foreground"}`} />
								<p className={`text-sm font-medium ${isDragOver ? "text-blue-600" : "text-muted-foreground"}`}>
									{isDragOver ? "Drop file here" : "Drag & drop files or click to select"}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Maximum {(maxSize / 1024 / 1024).toFixed(1)}MB
								</p>
							</div>
						</label>
					</div>
				</div>
			) : (
				<div className="space-y-3">
					{/* File Preview */}
					<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
						<div className="flex items-center space-x-3">
							{getFileIcon(selectedFile.type)}
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{selectedFile.name}</p>
								<p className="text-xs text-muted-foreground">
									{(selectedFile.size / 1024).toFixed(1)} KB • {validation.type}
								</p>
							</div>
						</div>
						<Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Image Preview */}
					{previewUrl && (
						<div className="relative rounded-lg overflow-hidden border bg-muted/30">
							<img
								src={previewUrl}
								alt="Preview"
								className="w-full h-32 object-cover"
								onLoad={() => URL.revokeObjectURL(previewUrl)}
							/>
						</div>
					)}

					{/* Upload Progress */}
					{uploading && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									{uploadError || "Uploading..."}
								</span>
								<span className="font-medium">{Math.round(uploadProgress)}%</span>
							</div>
							<div className="w-full bg-muted rounded-full h-2">
								<div
									className={`h-2 rounded-full transition-all duration-300 ease-out ${uploadError ? "bg-red-500" : "bg-blue-500"
										}`}
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
							{uploadError && (
								<p className="text-xs text-red-600">{uploadError}</p>
							)}
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex space-x-2">
						<Button
							onClick={handleFileUpload}
							disabled={uploading || !validation.isValid}
							className="flex-1"
							size="sm"
						>
							{uploading ? (
								<div className="flex items-center">
									<div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
									Uploading...
								</div>
							) : (
								"Send File"
							)}
						</Button>
						<Button variant="outline" onClick={clearSelection} disabled={uploading} size="sm">
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Success Message */}
			{uploadedUrl && !uploading && (
				<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex items-center space-x-2">
						<div className="w-2 h-2 bg-green-500 rounded-full" />
						<span className="text-sm text-green-800 font-medium">File uploaded successfully!</span>
					</div>
				</div>
			)}
		</div>
	)
}
