// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { equalTo, get, getDatabase, orderByChild, push, query, ref } from "firebase/database";
import {
	getAuth,
	signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
	createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
	signOut as fbSignOut,
	onAuthStateChanged as fbOnAuthStateChanged,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyC6mDWgyLjpiHNfRFGU3MDgWIF5pQ6K9Zs",
	authDomain: "dudaji-chat.firebaseapp.com",
	databaseURL: "https://dudaji-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "dudaji-chat",
	storageBucket: "dudaji-chat.firebasestorage.app",
	messagingSenderId: "528480340545",
	appId: "1:528480340545:web:3f4efbf6ff54648f06d4c0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const auth = getAuth(app);

// convenience exports
export const roomsRef = () => ref(db, "rooms");
export const roomMetaRef = (roomId: string) => ref(db, `rooms/${roomId}/meta`);
export const roomMessagesRef = (roomId: string) => ref(db, `rooms/${roomId}/messages`);
export const pushMessage = (roomId: string, payload: any) => push(roomMessagesRef(roomId), payload);
export const createRoomRef = (name: string) => push(roomsRef(), { meta: { name, createdAt: Date.now() } });

/** NOTE: use plural 'users' to match your data example */
export const usersRef = () => ref(db, "users");

/** Auth wrappers using modular SDK functions (correct usage) */
export const signIn = (email: string, password: string) => fbSignInWithEmailAndPassword(auth, email, password);
export const register = (email: string, password: string) => fbCreateUserWithEmailAndPassword(auth, email, password);
export const logout = () => fbSignOut(auth);
export const onAuthStateChanged = (cb: (u: any) => void) => fbOnAuthStateChanged(auth, cb);

/** Dev helper: find user in Realtime DB by email (returns the object keyed by uid or null) */
export async function findUserByEmailInDB(email: string) {
	const q = query(usersRef(), orderByChild("email"), equalTo(email));
	const snap = await get(q);
	if (!snap.exists()) return null;
	return snap.val(); // returns object like { uid_1: { ... } }
}
