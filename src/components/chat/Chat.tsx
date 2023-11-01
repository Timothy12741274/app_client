import React from 'react';
import {AVATAR, userId} from "@/const/const";

export const Chat = ({m, groups, users, chats, onFoundUserClickHandler, i, writingUser}) => {
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

    // const writingUser = chats[i].find(u => u.is_writing)
    const isGroup = chats[i].length > 1

    return <div onClick={() => onFoundUserClickHandler(u)} key={i}>
        <img className={'avatar'} src={avatar ?? AVATAR} />
        {u?.username && u?.is_online && (u?.is_writing ? <div>Writing...</div> : <div>Online</div>)}
        <div>{name}</div>
        {writingUser && <div>{isGroup && writingUser.username} writing...</div>}
    </div>
}
