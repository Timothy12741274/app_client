import { configureStore } from '@reduxjs/toolkit';
import messageReducer from './slices/messageSlice';
import userReducer from './slices/userSlice'
import groupReducer from './slices/groupSlice'

export const store = configureStore({
    reducer: {
        messageData: messageReducer,
        userData: userReducer,
        groupData: groupReducer
    },
});

export type RootState = ReturnType<typeof store.getState>
