import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from 'store/store'

// Define a type for the slice state
export interface UserState {
	uid: string | null
	displayName: string | null
	email: string | null
}

// Define the initial state using that type
const initialState: UserState = {
	uid: null,
	displayName: null,
	email: null
}

export const userSlice = createSlice({
	name: 'user',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<any>) => {
			state.uid = action.payload.uid
			state.displayName = action.payload.displayName
			state.email = action.payload.email
		},
		getUser: (state) => {
			return state
		},
		logout: (state) => {
			state.uid = null
			state.displayName = null
			state.email = null
		}
	}
})

export const { getUser, setUser, logout } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => state.user
export default userSlice.reducer
