import { child, get, ref, set } from "firebase/database";
import { db } from "config/firebase";

export const saveUserToDB = async (user: any) => {
	const userRef = ref(db, "users/" + user.uid);
	await set(userRef, {
		email: user.email,
		createdAt: Date.now(),
		displayName: user.displayName || null,
		photoURL: user.photoURL || null,
	});
};


export async function getUserByUid(uid: string) {
	try {
		const snapshot = await get(child(ref(db), `users/${uid}`))
		if (snapshot.exists()) {
			return snapshot.val()
		} else {
			console.log("❌ No user found with this uid")
			return null
		}
	} catch (error) {
		console.error("🔥 Error fetching user by uid:", error)
		throw error
	}
}