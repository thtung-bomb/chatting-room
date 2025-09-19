
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
// tungbomb2k3

// File upload helper functions
export const uploadFile = async (file: File, bucket: string, path: string) => {
	try {
		const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
			cacheControl: '3600',
			upsert: false
		})

		if (error) {
			console.error('Upload error details:', error)

			// Handle specific RLS errors with helpful message
			if (error.message.includes('row-level security policy') || error.message.includes('new row violates')) {
				throw new Error(`Storage security error: No policy configured for bucket '${bucket}'`)
			}

			// Handle bucket not found
			if (error.message.includes('Bucket not found')) {
				throw new Error(`Error uploading file to Storage: Bucket '${bucket}' is not exist. Please create new bucket in Storage Dashboard.`)
			}

			// Handle file size
			if (error.message.includes('Payload too large')) {
				throw new Error('File too large. Maximum 50MB.')
			}

			throw new Error(`Upload failed: ${error.message}`)
		}

		return data
	} catch (error) {
		console.error('Upload error:', error)
		throw error
	}
}

export const getFileUrl = (bucket: string, path: string) => {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path)

	return data.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
	const { error } = await supabase.storage.from(bucket).remove([path])

	if (error) throw error
}
