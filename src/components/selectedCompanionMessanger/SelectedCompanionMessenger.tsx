import React, {createRef, useEffect, useMemo, useRef, useState} from 'react';
import {AVATAR, baseURL, inst, userId} from "@/const/const";
// import {Message} from "@/components/Message";
import {addGroup, setGroups} from "@/store/slices/groupSlice";
import {getDataString} from "@/fn/getDataString";
import {addMessage, addMessages, setReadMessage} from "@/store/slices/messageSlice";
import {getTimeFromDate} from "@/fn/getTimeFromDate";
import {addUser, setCompanionData, setHasRefInitialized, setUsers} from "@/store/slices/userSlice";
import {useSearchParams} from "next/navigation";
import {useDispatch} from "react-redux";
import {useSelector} from "@/store/hooks/typedUseSelector";
import {Message} from "@/components/message/Message";

const SelectedCompanionMessenger = ({chats, groups, messages, user, usersFromUserMessenger, users, groupShowedWritingUsers}) => {
    const { companionData, hasRefInitialized } = useSelector(state => state.userData)

    const { get } = useSearchParams()

    const userIdFromUrl = get('user-id');
    const groupIdFromUrl = get('group-id');

    // const companion = isUserCurrentChat ? users.find(u => u.id === Number(userIdFromUrl)) : groups.find(g => g.id === Number(groupIdFromUrl))

    const isMessageLoading = useSelector(state => state.messageData.isMessageLoading)



    const dispatch = useDispatch()

    const [isProfileShowed, setIsProfileShowed] = useState(false)

    const [isAddMembersToGroupModalShowed, setIsAddMembersToGroupModalShowed] = useState(false)

    const [isDeleteMemberModalShowed, setIsDeleteMemberModalShowed] = useState(false)

    const [usersFromNewGroupMemberSearch, setUsersFromNewGroupMemberSearch] = useState([])

    const [currentChatMessagesState, setCurrentChatMessagesState] = useState([])


    const [text, setText] = useState('')

    const messageListRef = useRef(null)

    const avatar = companionData?.avatar_photo_urls?.slice(-1)[0] ?? companionData?.avatar_urls?.slice(-1)[0]

    const [currentCompanionId, setCurrentCompanionId] = useState(0)

    const isUserCurrentChat = useMemo(() => !!get('user-id'), [!!get('user-id')])

    const usernameOrGroupName = companionData.username ?? companionData.name

    const currentChatMessages = useMemo(() => {
        const filteredAndSortedMessages = chats.find(c => get('user-id') ?
            c[0].from_user_id === Number(get('user-id')) || c[0].to_user_id === Number(get('user-id'))
            :
            c[0].group_id === Number(get('group-id'))
        )
        // console.log(get('user-id'), get('group-id'), 'aaa', filteredAndSortedMessages)
        if (!filteredAndSortedMessages) {
            console.log(chats)
        }


        // .filter(m =>
        //     (m.from_user_id === companionData.id || m.to_user_id === companionData.id) &&
        //     (m.from_user_id === Number(userId) || m.to_user_id === Number(userId))
        // )
        // .sort(compareMessagesByDate)

        return filteredAndSortedMessages

    }, [messages, companionData, chats, currentCompanionId])

/*    const refs = useMemo(() => {
        return currentChatMessages?.map(() => createRef())
    }, [currentChatMessages])*/

    const [refs, setRefs] = useState([])

    // const [companionStatus, setCompanionStatus] = useState()

    let firstUnreadMessageId = -1



    if (currentChatMessages) {
        currentChatMessages.map((m, i) => {
            if (!m.read && m.from_user_id !== Number(userId) && firstUnreadMessageId === -1) firstUnreadMessageId = i
        })
    }





    let lastOnlineDateObj
    let lastSeenCompanionTime
    let lastOnlineDateDay
    let lastOnlineDateMonth
    let lastOnlineDateFormatted
    let isLastSeenDateOfCurrDay

    let timer = null


    // const groupsAndUsers = [...groupsFromUserMessenger, ...usersFromUserMessenger]


    const addMembersInputRef = useRef(null)

    if (companionData && companionData.last_online_date) {
        lastOnlineDateObj = new Date(companionData.last_online_date)

        lastSeenCompanionTime = getTimeFromDate(lastOnlineDateObj)

        lastOnlineDateDay = lastOnlineDateObj.getDate()

        lastOnlineDateMonth = lastOnlineDateObj.toLocaleString('default', { month: 'long' })

        lastOnlineDateFormatted = `${lastOnlineDateDay} ${lastOnlineDateMonth}`

        isLastSeenDateOfCurrDay = new Date().toISOString().split('T')[0] === lastOnlineDateObj.toISOString().split('T')[0]
    }

    const [currentChatIndex, setCurrentChatIndex] = useState(-1)
    // let currentChatIndex

    // const handleIntersection = (entries, i) => {
    //     entries.forEach((entry) => {
    //         if (entry.isIntersecting) {
    //             // Элемент появился на экране
    //             // Вы можете выполнить здесь нужные действия
    //             //console.log('Элемент появился на экране');
    //             if (!currentChatMessages[i].read && currentChatMessages[i].from_user_id !== Number(userId)) {
    //                 inst.put('/messages/' + i).then(() => dispatch(setReadMessage(i)))
    //             }
    //         }
    //     });
    // };



    const onKeyDownHnd = (e) => {
        if (e.key === 'Enter') {
            sendMessageHnd()
        }
    }

    const sendMessageHnd = () => {
        const time = getDataString()
        let newMessage = { time, text, from_user_id: Number(userId), isRead: companionData.is_online }

        if (isUserCurrentChat) newMessage.to_user_id = companionData.id
        else {
            newMessage.to_user_ids = companionData.user_ids
            newMessage.group_id = companionData.group_id
        }

        inst.post('/messages', newMessage)
            .then(res => dispatch(addMessage(res.data)))

        setText('')
    }

    const onDeleteMember = (m) => {
        inst.put('/groups/delete-member/', {userId: m.id, groupId: companionData.id})
            .then(() => {
                const updatedGroups = groups.map(g => g.id === companionData.id ? {...g, user_ids: g.user_ids.filter(id => id !== m.id)} : g)

                dispatch(setGroups(updatedGroups))
            })
    }

    const onAddMemberToGroup = (u) => {
        inst.put('/groups/add-member', {userId: u.id, groupId: companionData.id})
            .then(() => {
                const updatedGroups = groups.map(g => g.id === companionData.id ? {...g, user_ids: [...g.user_ids, u.id]} : g)
                dispatch(setGroups(updatedGroups))
                addMembersInputRef.current.value = ''
                setIsAddMembersToGroupModalShowed(false)
            })




    }

    const [isWriting, setIsWriting] = useState(false)

    const onEnterMessageChange = v => { 
        // inst.post('/users/' + userId + '/update-writing-status', { isWriting: true})
        // clearInterval(timer)
        //
        // timer = setTimeout(() => {
        //     inst.post('/users/' + userId + '/update-writing-status', { isWriting: false})
        // }, 2000)
        if (!isWriting) setIsWriting(true)
        setText(v)
    }

    const onNewGroupMembersSearchInputChange = async (v) => {
        if (v.length > 3) {
            const { data: foundUsers } = await inst.get('/users/find-users', {params: { v }})

            setUsersFromNewGroupMemberSearch(foundUsers)
        }  else {


            const foundUsers = usersFromUserMessenger?.filter(u => u.first_name.startsWith(v) ||
                u.second_name.startsWith(v) ||
                u.username.split('_').map(s => s.startsWith(v)).some(bool => bool)
            ) ?? []

            setUsersFromNewGroupMemberSearch(foundUsers)
        }
    }

    useEffect(() => {
        // console.log(chats.indexOf(chats.find(c => c[0].id === currentChatMessagesState[0].id)), 'ooooooo')
        if (chats && currentChatMessagesState && currentChatMessagesState[0]) setCurrentChatIndex(chats.indexOf(chats.find(c => c[0].id === currentChatMessagesState[0].id)))
        // if (chats && currentChatMessagesState && currentChatMessagesState[0]) currentChatIndex = chats.indexOf(chats.find(c => c[0].id === currentChatMessagesState[0].id))
    }, [chats, currentChatMessagesState])

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (companionData.id && usernameOrGroupName && isUserCurrentChat) {
                inst.get(`/users/${companionData.id}/get-user-status`)
                    .then(res => {
                        if (res.data.isOnline !== companionData.is_online) {
                            const updatedUsers = users.map(u => u.id === companionData.id ? {...u, is_online: res.data.isOnline} : u)
                            dispatch(setCompanionData(u => ({...u, is_online: res.data.isOnline})))
                            dispatch(setUsers(updatedUsers))
                        } else if (res.data.isWriting !== companionData.is_writing) {
                            const updatedUsers = users.map(u => u.id === companionData.id ? {...u, is_writing: res.data.isWriting} : u)
                            dispatch(setCompanionData(u => ({...u, is_writing: res.data.isWriting})))
                            dispatch(setUsers(updatedUsers))
                        }
                    })
            }
            // console.log('here', messages, Array.from(new Map(messages.map(obj => [obj.id, obj])).values()))
            if (messages && messages.length > 0) {
                const maxMessageId = messages.map(m => m.id).reduce((acc, curr) => acc > curr ? acc : curr)
                inst.get(`/messages/added-messages`, { params: {'max_message_id': maxMessageId}})
                    .then(res => {
                        if (res.data.length > 0) dispatch(addMessages(res.data))
                    })
            }

            inst.post('/users/' + userId + '/update-writing-status', { isWriting })

        }, 5000)

        return () => {
            clearInterval(intervalId)
        }
    }, [companionData, messages, isUserCurrentChat, isWriting])

    useEffect(() => {
        // console.log('changed currChatMess')
        setCurrentChatMessagesState(currentChatMessages)
    }, [currentChatMessages])

    useEffect(() => {
        if (messageListRef.current) {
            setTimeout(() => {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }, 0);
        }
    }, [messageListRef.current && messageListRef.current.scrollHeight, currentChatMessagesState])

    useEffect(() => {
        if (!hasRefInitialized && messageListRef.current && refs && refs[0] && refs[0].current) scrollToUnread()
    }, [messageListRef.current, refs])

    useEffect(() => {
        const isUserCurrentChat = !!get('user-id')
        const companionIdFromState = get(isUserCurrentChat ? 'user-id' : 'group-id')
        const stateOfSearch = isUserCurrentChat ? users : groups
        const companionFromState = stateOfSearch.find(u => u.id === Number(companionIdFromState))
        if (!companionFromState) {
            if (isUserCurrentChat) {
                inst.get('/users/get-user/' + get('user-id'))
                    .then(res => {
                        dispatch(setCompanionData(res.data.user))
                        dispatch(addUser(res.data.user))
                    })
            } else {
                inst.get('/groups/get-group/' + get('group-id'))
                    .then(res => {
                        dispatch(setCompanionData(res.data))
                        dispatch(addGroup(res.data))
                    })
            }


            // inst.get('/users/get-user/' + get('user-id')).then(( res  => {
            //     console.log('user', res.data.user, res.data)
            //     setCompanionData(res.data.user)
            //     dispatch(addUsers(res.data.user))
            // }))
        } else if (companionFromState && companionData.id !== companionFromState.id) {
            dispatch(setCompanionData(companionFromState))
        }
    }, [users, groups, isUserCurrentChat])

    useEffect(() => {
        setCurrentCompanionId(Number(get('user-id') ?? get('group-id')))
    }, [get('user-id'), get('group-id')])



    useEffect(() => {
        setRefs(currentChatMessages?.map(() => createRef()))
        console.log('1', currentChatMessages?.map(() => createRef()))
        // refs = currentChatMessages?.map(() => createRef())
    }, [currentChatMessages])

    useEffect(() => {
        setRefs(currentChatMessages?.map(() => createRef()))
        console.log('1', currentChatMessages?.map(() => createRef()))
        // refs = currentChatMessages?.map(() => createRef())
    }, [])



    const scrollToUnread = () => {
        dispatch(setHasRefInitialized(true))


        const unreadMessageIds = currentChatMessages
            .filter(m => !m.read && m.from_user_id !== Number(userId))
            .map(m => m.id)

        const unreadMessagesHeight = refs.filter((r, i) => unreadMessageIds.includes(i)).reduce((acc, curr) => {
            return acc + curr.current.scrollHeight
        }, 0)

        if (firstUnreadMessageId && unreadMessagesHeight > 650) {
            refs[firstUnreadMessageId].current.scrollIntoView({ behavior: 'smooth' })
        } else {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight
        }
    }

    // const status =                     companionData.is_online ?
    //     companionData.is_writing ?
    //         'Typing...' :
    //         'Online'
    //     :
    //     companionData.last_online_date ?
    //         'Last seen at ' + isLastSeenDateOfCurrDay ? lastSeenCompanionTime : lastOnlineDateFormatted
    //         :
    //         'Offline'
    //
    // console.log(status, 'status')

     console.log(groupShowedWritingUsers, currentChatIndex, 'pppppp')
    // console.log(groupShowedWritingUsers.length > 0, groupShowedWritingUsers[currentChatIndex], groupShowedWritingUsers[currentChatIndex], `${groupShowedWritingUsers[currentChatIndex]} is writing...`, 'LLLLLLLL')

    if (isMessageLoading || typeof companionData?.id === 'undefined' || (!refs && currentChatMessages && currentChatMessages.length > 0)) return <div><div>Loading...</div><div>{isMessageLoading && 'first'} {!companionData?.id && 'second'}</div></div>

    return (
        <div>
            <div>
                <div className={'chat_panel'} /*onClick={() => push(`/profile?${isUserCurrentChat ? 'user-id' : 'group-id'}=${companionData.id}`)}*/ onClick={() => setIsProfileShowed(true)} style={{display: "flex", alignItems: "center"}}>
                    <img
                        src={
                            avatar ?
                                baseURL + avatar
                                :
                                AVATAR
                        }
                        className={'avatar'}
                    />
                    <span>{usernameOrGroupName}</span>
                    {isUserCurrentChat && <span>

                {
                    companionData.is_online ?
                        companionData.is_writing ?
                            'Typing...' :
                            'Online'
                        :
                        companionData.last_online_date ?
                            'Last seen at ' + isLastSeenDateOfCurrDay ? lastSeenCompanionTime : lastOnlineDateFormatted
                            :
                            'Offline'
                }
            </span>}
                    {
                        !isUserCurrentChat &&
                        <span>
                            {
                                groupShowedWritingUsers.length > 0 &&
                                groupShowedWritingUsers[currentChatIndex] &&
                                `${groupShowedWritingUsers[currentChatIndex].username} is writing...`
                            }
                        </span>
                    }
                </div>
                <div ref={messageListRef} style={{background: 'green', width: '620px', overflow: "scroll", height: '650px'}}>
                    {
                        currentChatMessagesState?.map((m, i) => {
                            return <Message
                                currentChatMessages={currentChatMessages}
                                i={i}
                                m={m}
                                companionData={companionData}
                                user={user}
                                firstUnreadMessageId={firstUnreadMessageId}
                                messageRef={refs[i]}
                                usernameOrGroupName={usernameOrGroupName}
                            />
                        })
                    }
                </div>

                <div className={'chat_panel'}>
                    <input value={text} onChange={e => onEnterMessageChange(e.currentTarget.value)} onKeyDown={onKeyDownHnd}/>
                    <button onClick={sendMessageHnd}>Send</button>
                </div>
            </div>
            {isProfileShowed && <div>
                <div>
                    <span onClick={() => setIsProfileShowed(false)}>Close</span>
                    <span>Profile</span>
                    <span>Edit</span>
                </div>
                <div>
                    <img
                        src={
                            avatar ?
                                baseURL + avatar
                                :
                                AVATAR
                        }
                        className={'avatar'}
                    />
                    <span>{usernameOrGroupName}</span>
                    {!isUserCurrentChat && <span>{companionData.user_ids.length} members</span>}
                    {!isUserCurrentChat && companionData.admin_ids.includes(Number(userId)) && <div onClick={() => setIsAddMembersToGroupModalShowed(true)}>Add member</div>}

                    {!isUserCurrentChat && <div>
                        {
                            companionData.user_ids.map(id => {
                                let u = users.find(u => u.id === id)


                                return <div>
                                    <img className={'avatar'}
                                         src={u.avatar_photo_urls?.slice(-1)[0] ? `${baseURL}${u.avatar_photo_urls.slice(-1)[0]}` : AVATAR}
                                    />
                                    <div>
                                        <span>{u.first_name}</span>
                                        {!isUserCurrentChat && companionData.admin_ids.includes(u.id) && <span>admin</span>}
                                    </div>
                                    <div>{u.is_online ? 'online' : `Last seen at ${u.last_online_date}`}</div>
                                    {companionData.admin_ids.includes(Number(userId)) && u.id !== Number(userId) &&
                                        <div onClick={() => setIsDeleteMemberModalShowed(true)}>Delete</div>}
                                </div>
                            })
                        }
                    </div>
                    }
                </div>
            </div>}
            {isAddMembersToGroupModalShowed && <div className={'modal'}>
                <span onClick={() => setIsAddMembersToGroupModalShowed(false)}>Close</span>
                <input onChange={e => onNewGroupMembersSearchInputChange(e.currentTarget.value)} ref={addMembersInputRef} />
                <div>
                    {
                        usersFromNewGroupMemberSearch.length !== 0 && <div>
                            {
                                usersFromNewGroupMemberSearch.map(u => <div style={{display: "flex"}}
                                                                            onClick={() => onAddMemberToGroup(u)}>
                                    <img className={'avatar'}
                                         src={u.avatar_photo_urls?.slice(-1)[0] ? `${baseURL}${u.avatar_photo_urls.slice(-1)[0]}` : AVATAR /*baseURL + u.avatar_photo_urls.slice(-1)[0] ?? ''*/}/>
                                    <div>
                                        <div>{u.first_name} {u.second_name}</div>
                                        <div>{u.username}</div>
                                    </div>
                                </div>)
                            }
                        </div>
                    }
                </div>
            </div>}

            {isDeleteMemberModalShowed && <div className={'modal'}>
                <div>Delete user?</div>
                <div>
                    <span onClick={() => onDeleteMember()}>Yes</span>
                    <span>No</span>
                </div>
            </div>
            }
        </div>
    );
};

export default SelectedCompanionMessenger;