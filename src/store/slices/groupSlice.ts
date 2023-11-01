import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    groups: [],
    // isMessageLoading: false
};

const counterSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        addGroup: (state, action) => {
            state.groups = [...state.groups, action.payload]
        },
        addGroups: (state, action) => {
            state.groups = [...state.groups, ...action.payload]
        },
        setGroups: (state, action) => {
            state.groups = action.payload
        },

        // setMessages: (state, action) => {
        //     state.messages = action.payload
        // },
        // setIsMessageLoading: (state, action) => {
        //     state.isMessageLoading = action.payload
        // },
        // setReadMessage: (state, action) => {
        //     state.messages[action.payload].read = true
        // },

    },
});

export const { addGroup, setGroups, setIsMessageLoading, setReadMessage, addGroups } = counterSlice.actions;

export default counterSlice.reducer;