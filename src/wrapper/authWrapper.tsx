import React, {useEffect, useState} from 'react';
import {useSelector} from "@/store/hooks/typedUseSelector";
import {inst, userId} from "@/const/const";
import cookie from "js-cookie";
import {useDispatch} from "react-redux";
import {setUsers} from "@/store/slices/userSlice";
import {useRouter} from "next/navigation";
import {addMessages, setMessages} from "@/store/slices/messageSlice";

export const AuthWrapper = ({ children}) => {
    const dispatch = useDispatch()

    const { push } = useRouter()

    const { users, messages } = useSelector(state => state.userData)

    // console.log(users)

    // const [isLoading, setIsLoading] = useState(true)
    // const [isUsersLoading, setIsUsersLoading] = useState(true)
    // const [isMessagesLoading, setIsMessagesLoading] = useState(true)

    useEffect(() => {
        if (!userId) push('/login')
    }, [])

    return (
        // /*isEmptyObject(users)*/ isUsersLoading && isMessagesLoading ? <div>Loading...</div> : <div>{children}</div>
        <div>{children}</div>
    );
};

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

