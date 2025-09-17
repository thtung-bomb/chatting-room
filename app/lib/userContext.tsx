"use client"

import { db } from "config/firebase"
import { get, query, orderByChild, equalTo, ref } from "firebase/database"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
	id: string
	name: string
	email: string
	avatar: string
}

interface UserContextType {
	user: User | null
	setUser: (user: User | null) => void
	isAuthenticated: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		// Check if user is stored in localStorage
		const storedUser = localStorage.getItem("dudaji-user")
		if (storedUser) {
			setUser(JSON.parse(storedUser))
		}
	}, [])

	const login = async (email: string, password: string) => {
		// 1) query user theo email trong Realtime DB
		const q = query(ref(db, "users"), orderByChild("email"), equalTo(email))
		const snap = await get(q)

		if (!snap.exists()) throw new Error("User not found")

		const users = snap.val()
		const uid = Object.keys(users)[0]
		const userData = users[uid]

		// 2) check password
		if (userData.password !== password) throw new Error("Invalid password")

		// 3) chuẩn hoá appUser
		const appUser: User = {
			id: uid,
			name: userData.name,
			email: userData.email,
			avatar: userData.avatar,
		}

		setUser(appUser)
		localStorage.setItem("dudaji-user", JSON.stringify(appUser))
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem("dudaji-user")
	}

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				isAuthenticated: !!user,
				login,
				logout,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}

export function useUser() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider")
	}
	return context
}
