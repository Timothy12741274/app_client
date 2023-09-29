import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    messages: [],
    isMessageLoading: false
};

const counterSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages = [...state.messages, action.payload]
        },
        addMessages: (state, action) => {
            state.messages = [...state.messages, ...action.payload]
        },
        setMessages: (state, action) => {
            state.messages = action.payload
        },
        setIsMessageLoading: (state, action) => {
            state.isMessageLoading = action.payload
        },
        setReadMessage: (state, action) => {
            state.messages[action.payload].read = true
        },

    },
});

export const { addMessage, setMessages, setIsMessageLoading, setReadMessage, addMessages } = counterSlice.actions;

export default counterSlice.reducer;
