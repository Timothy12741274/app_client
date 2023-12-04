import { createSlice } from '@reduxjs/toolkit';

const initialState: initialStateType = {
    users: [],
    companionData: {},
    hasRefInitialized: false,
    userId: 0
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
        setCompanionData: (state, action) => {
            state.companionData = action.payload
        },
        setHasRefInitialized: (state, action) => {
            state.hasRefInitialized = action.payload
        },
        addUser: (state, action) => {
            state.users = [...state.users, action.payload]
        },
        changeUsersStatus: (state, action) => {
            for (let i = 0; i < action.payload.length; i++) {
                if (!state.users.map(u => u.id).includes(action.payload[i].id)) continue

                const indexToModify = state.users.findIndex(u => u.id === action.payload[i].id)
                state.users[indexToModify].is_writing = !state.users[indexToModify].is_writing
            }


            if (state.users.length < action.payload.length) state.users = action.payload
            else {
                for (let i = 0; i < action.payload.length; i++) {
                    const indexToModify = state.users.findIndex(u => u.id === action.payload[i].id)
                    state.users[indexToModify] = action.payload[i]
                }
            }

            // state.users = [...state.users, action.payload]
            const updatedCompanionData = action.payload.find(u => u.id === state.companionData.id)

            if (updatedCompanionData) {
                state.companionData = updatedCompanionData
            }
        },
        setUserId: (state, action) => {
            state.userId = action.payload
        }
    },
});

export const { setUsers, addUser, changeUsersStatus, setCompanionData, setHasRefInitialized, setUserId } = counterSlice.actions;

export default counterSlice.reducer;
