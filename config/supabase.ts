
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
// tungbomb2k3

// File upload helper functions
export const uploadFile = async (file: File, bucket: string, path: string) => {
	const { data, error } = await supabase.storage.from(bucket).upload(path, file)

	if (error) throw error
	return data
}

export const getFileUrl = (bucket: string, path: string) => {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path)

	return data.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
	const { error } = await supabase.storage.from(bucket).remove([path])

	if (error) throw error
}
