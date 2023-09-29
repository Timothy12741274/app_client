import { configureStore } from '@reduxjs/toolkit';
import messageReducer from './slices/messageSlice';
import userReducer from './slices/userSlice'

export const store = configureStore({
    reducer: {
        messageData: messageReducer,
        userData: userReducer
    },
});

export type RootState = ReturnType<typeof store.getState>
