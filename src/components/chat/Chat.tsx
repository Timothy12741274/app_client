import React from 'react';
import {AVATAR, userId} from "@/const/const";

export const Chat = ({m, groups, users, chats, onFoundUserClickHandler, i, writingUser, groupIdFromUrl}) => {
    let u
    if (m.group_id) {
        u = groups.find(g => g.id === m.group_id)
    } else {
        const uId = m.from_user_id === Number(userId) ? m.to_user_id : m.from_user_id

        u = users?.find(u => u.id === uId)
        // console.log(users.find(u => u.id === uId), uId, users)
    }

    // console.log('u', u)


    const avatar = u?.avatar_photo_urls?.slice(-1)[0] ?? u?.avatar_urls?.slice(-1)[0] ?? AVATAR
    const name = u?.first_name ??  u?.name

    const lastMessage = chats[i].slice(-1)[0]
    const lastMessageText = lastMessage.text
    const lastMessageUserName = users.find(u => u.id === lastMessage.from_user_id).username
    let lastMessageShort = lastMessageUserName + ': ' + lastMessageText
    lastMessageShort = lastMessageShort.substring(0, 26).concat('...')

    console.log(chats, lastMessage, 'Chat.tsx')



    // const writingUser = chats[i].find(u => u.is_writing)
    const isGroup = chats[i].length > 1

    console.log(u, 'u', users, 'users')
    console.log(groupIdFromUrl, !!groupIdFromUrl, 'XXXXXXXX')

    return <div onClick={() => onFoundUserClickHandler(u)} key={i}>
        <img className={'avatar'} src={avatar ?? AVATAR} />
        {u?.username && u?.is_online && (u?.is_writing ? <div>Writing...</div> : <div>Online</div>)}
        {lastMessageText ? <div>{lastMessageShort}</div> : ''}
        <div>{name}</div>
        {writingUser && <div>{`${!!groupIdFromUrl && writingUser.username}`} writing...</div>}
    </div>
}
