import { createSlice } from '@reduxjs/toolkit';

const initialState: initialStateType = {
    users: []
};

type initialStateType = {
    // id: number
    // email: string
    // password: string
    // city: string
    // country: string
    // description: string

}

const counterSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload
        },
        addUsers: (state, action) => {
            state.users = [...state.users, action.payload]
        }
    },
});

export const { setUsers, addUsers } = counterSlice.actions;

export default counterSlice.reducer;
