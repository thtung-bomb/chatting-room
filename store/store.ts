import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import userReducer from './features/slice/useSlice'

// Create a client-only storage that works with SSR
const createNoopStorage = () => {
	return {
		getItem(_key: string) {
			return Promise.resolve(null)
		},
		setItem(_key: string, value: any) {
			return Promise.resolve(value)
		},
		removeItem(_key: string) {
			return Promise.resolve()
		},
	}
}

// Use localStorage only on client-side, otherwise use noop storage
const clientStorage = typeof window !== 'undefined' ? storage : createNoopStorage()

// 1. config: what to persist
const persistConfig = {
	key: 'root',
	storage: clientStorage,
	whitelist: ['user'], // only persist user slice
}

// 2. combine reducers (you may add more slices later)
const rootReducer = combineReducers({
	user: userReducer,
})

// 3. wrap reducers with persist
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 4. create store
export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
			},
		}),
})

// 5. export persistor (only create on client-side)
export const persistor = typeof window !== 'undefined'
	? persistStore(store)
	: null

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
