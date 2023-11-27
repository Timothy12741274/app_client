import React, {useEffect, useRef, useState} from 'react';
import {userId} from "@/const/const";
import {getTimeFromDate} from "@/fn/getTimeFromDate";


export const Message = ({m, i, messageRef, firstUnreadMessageId, currentChatMessages, companionData, user, usernameOrGroupName}) => {

    const [isMoreShowed, setIsMoreShowed] = useState(false)

    const ref = useRef()

    const date = new Date(m.time)

    const day = date.getDate()

    const month = date.toLocaleString('default', { month: 'long' })

    const time = getTimeFromDate(date)

    const dataForUser = `${day} ${month}`

    const isSelf = m.from_user_id === Number(userId)

    useEffect(() => {
        if (isMoreShowed) {
            addEventListener("click", )
        }
    }, [isMoreShowed])

    return <div
        key={i}
        /*ref={(el) => (divRefs.current[i] = el)}*/
        ref={messageRef}
    >
        {firstUnreadMessageId === i && <div>Unread messages</div>}
        {
            (
                (currentChatMessages && !currentChatMessages[i - 1])
                ||
                (currentChatMessages && currentChatMessages[i - 1] && m.time.split('T')[0] !== currentChatMessages[i - 1].time.split('T')[0])
            ) && <div className={'message_data_label'}>{dataForUser}</div>
        }
        {isMoreShowed && <div style={{position: "absolute"}}>
            <div>Data about message</div>
            <div>Answer</div>
            <div>React</div>
            <div>Resend</div>
            <div>In favorites</div>
            <div>Answer</div>
        </div>}
        <div className={m.from_user_id === Number(userId) ? 'user_message' : 'companion_message'}>
            {Array.isArray(companionData) && <div>{isSelf ? user.username : usernameOrGroupName}</div>}
            <div>{m.text}</div>
            {/*<div>{m.time.substring(11, 16)}</div>*/}
            <div>{time}</div>
            <div>{m.read ? 'Read' : 'Unread'}</div>
            <div
                style={{position: "absolute", top: 0, right: 5, fontSize: '12px'}}
                onClick={() => setIsMoreShowed(true)}
            >More</div>
        </div>
    </div>
}

