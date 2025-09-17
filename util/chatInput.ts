import supabase from '../config/supabase'
import { getDatabase, ref, push } from "firebase/database";

export async function handleFileUpload(file: File, roomId: string, sender: string) {
	// 1. Upload lên Supabase
	const { data, error } = await supabase.storage
		.from('chat-files')
		.upload(`room-${roomId}/${Date.now()}-${file.name}`, file)

	if (error) {
		console.error('Upload error:', error.message)
		return
	}

	// 2. Lấy public URL
	const { data: urlData } = supabase
		.storage
		.from('chat-files')
		.getPublicUrl(`room-${roomId}/${Date.now()}-${file.name}`)

	const fileUrl = urlData.publicUrl

	// 3. Push message vào Firebase
	const db = getDatabase()
	push(ref(db, `rooms/${roomId}/messages`), {
		sender,
		fileUrl,
		createdAt: Date.now()
	})
}
