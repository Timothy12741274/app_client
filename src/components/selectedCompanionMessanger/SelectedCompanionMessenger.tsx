import React, {createRef, useEffect, useMemo, useRef, useState} from 'react';
import {AVATAR, baseURL, inst, userId} from "@/const/const";
import {addGroup, setGroups} from "@/store/slices/groupSlice";
import {getDataString} from "@/fn/getDataString";
import {addMessage, addMessages, setMessages} from "@/store/slices/messageSlice";
import {getTimeFromDate} from "@/fn/getTimeFromDate";
import {addUser, setCompanionData, setHasRefInitialized, setUsers} from "@/store/slices/userSlice";
import {useSearchParams} from "next/navigation";
import {useDispatch} from "react-redux";
import {useSelector} from "@/store/hooks/typedUseSelector";
import {Message} from "@/components/message/Message";
import {DataAboutMessage} from "@/components/dataAboutMessage/DataAboutMessage";
import FormData from "form-data";

const SelectedCompanionMessenger = ({chats, groups, messages, user, usersFromUserMessenger, users, groupShowedWritingUsers, setModalPhotoCallback}) => {
    const { companionData, hasRefInitialized } = useSelector(state => state.userData)

    const { get } = useSearchParams()

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

    const [selectedInfoMessage, setSelectedInfoMessage] = useState({})

    const inputRef = useRef(null)

    const isUserCurrentChat = useMemo(() => !!get('user-id'), [!!get('user-id')])

    const usernameOrGroupName = companionData.username ?? companionData.name

    const currentChatMessages = useMemo(() => {
        const filteredAndSortedMessages = chats.find(c => get('user-id') ?
            c[0].from_user_id === Number(get('user-id')) || c[0].to_user_id === Number(get('user-id'))
            :
            c[0].group_id === Number(get('group-id'))
        )

        return filteredAndSortedMessages

    }, [messages, companionData, chats, currentCompanionId])

    const [refs, setRefs] = useState([])

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

    const onKeyDownHnd = (e) => {
        if (e.key === 'Enter') {
            sendMessageHnd()
        }
    }

    const sendMessageHnd = () => {
        const time = getDataString()
        const formData = new FormData()

        formData.append('time', time)
        formData.append('text', text)
        formData.append('from_user_id', Number(userId))

        if (messageToAnswerId) formData.append('messageToAnswerId', messageToAnswerId)


        if (isUserCurrentChat) {
            formData.append('to_user_id', companionData.id)
            formData.append('isRead', companionData.is_online)
        }
            else {
                formData.append('to_user_ids', companionData.user_ids.filter(id => id !== Number(userId)))
            formData.append('group_id', companionData.id)
            formData.append('isRead', users.filter(u => companionData.user_ids.includes(u.id)).every(u => u.is_online))
        }

        if (inputPhotos.length !== 0) {
            for (let i = 0; i < inputPhotos.length; i++) {
                formData.append('photos', inputPhotos[i])
            }
        }

        inst.post('/messages', formData)
            .then(({ data: { message }}) => message ? dispatch(addMessage(message)) : '')

        setText('')
        setAddedImages([])
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

    const [messageToAnswerId, setMessageToAnswerId] = useState(0)

    const [selectedMessages, setSelectedMessages] = useState([])

    const [isSelectMode, setIsSelectMode] = useState(false)

    const [isDeleteMode, setIsDeleteMode] = useState(false)
    const deleteModalRef = useRef(null)

    const moreMenuRef = useRef(null)

    const fileInputRef = useRef(null)

    const [isUserChoiceModalOpened, setIsUserChoiceModalOpened] = useState(false)

    const [foundUsersFromUserSearch, setFoundUsersFromUserSearch] = useState([])

    const [selectedUsersToResendMessages, setSelectedUsersToResendMessages] = useState([])

    const [selectedMessage, setSelectedMessage] = useState({})

    const [isMoreOpened, setIsMoreOpened] = useState(false)

    const [inputPhotos, setInputPhotos] = useState([])

    const [addedImages, setAddedImages] = useState([])

    const messageToAnswer = useMemo(() => {
        return currentChatMessagesState.find(m => m.id === messageToAnswerId)
    }, [currentChatMessagesState, messageToAnswerId])

    const messageToAnswerOfMessageInInfoMode = messages.find(m => m.message_to_answer_id === selectedInfoMessage.message_to_answer_id)

    const onEnterMessageChange = v => {
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

    const onSelectMessage = (e, m) => {
        setSelectedMessages(s => e.target.checked ? [...s, m] : s.filter(fm => fm.id !== m.id))
    }

    const onSearchInputChange = (v) => {
        if (v.length === 0) {
            setFoundUsersFromUserSearch(
                chats.map(([m, ...rest]) => {
                    const uId = m.from_user_id === Number(userId) ? m.to_user_id : m.from_user_id

                    return m.group_id ? groups.find(g => g.id === m.group_id) : users.find(u => u.id === uId)
                })
            )
        }
        else if (v.length < 4) {
            setFoundUsersFromUserSearch(s => s.filter(item => {
                    const name = item.username ?? item.name

                    return name.toLowerCase().includes(v.toLowerCase())
                }
            ))
        } else {
            inst.get(`/users/find?t=${v}`)
                .then(({ data: { users } }) => {
                    setFoundUsersFromUserSearch(users)
                })
        }
    }

    const onOpenUserChoiceModal = () => {
        setIsUserChoiceModalOpened(true)
        setFoundUsersFromUserSearch(
            chats.map(([m, ...rest]) => {
                const uId = m.from_user_id === Number(userId) ? m.to_user_id : m.from_user_id

                return m.group_id ? groups.find(g => g.id === m.group_id) : users.find(u => u.id === uId)
            })
        )
    }

    const onSend = () => {
      inst.post('/messages/resend', { messages: selectedMessages, items: selectedUsersToResendMessages, time: getDataString() })
    }

    const onDeleteClick = (v) => {
        setIsDeleteMode(false)
          inst.post('/messages/delete', {messages: [selectedMessage], fromEveryone: v === '1'})
              .then(() => {
                  dispatch(setMessages(messages.map(m => m.id === selectedMessage.id ? v === '1' ? {...m, is_deleted: true} : {...m, is_deleted_from_me: true} : m)))
              })
    }

    const x = (e) => {
      if (moreMenuRef.current.contains(e.target)) {
          document.removeEventListener("click", x)
          setIsMoreOpened(false)
      }
    }

    const onMoreClick = () => {
        document.addEventListener("click", x)
        setIsMoreOpened(true)
    }

    const onFileInputChange = (e) => {
        // console.log([...e.target.files], 'FILES')
        const r = new FileReader()
        const lastAddedFile = e.target.files[e.target.files.length - 1]
        r.onload = (e) => {
           setAddedImages(s => [...s, r.result])
        }
        r.readAsDataURL(lastAddedFile)
        setInputPhotos(s => [...s, lastAddedFile])
        fileInputRef.current.value = null
    }



    useEffect(() => {
        if (chats && currentChatMessagesState && currentChatMessagesState[0]) setCurrentChatIndex(chats.indexOf(chats.find(c => c[0].id === currentChatMessagesState[0].id)))
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
        } else if (companionFromState && companionData.id !== companionFromState.id) {
            dispatch(setCompanionData(companionFromState))
        }
    }, [users, groups, isUserCurrentChat])

    useEffect(() => {
        setCurrentCompanionId(Number(get('user-id') ?? get('group-id')))
    }, [get('user-id'), get('group-id')])



    useEffect(() => {
        setRefs(currentChatMessages?.map(() => createRef()))
    }, [currentChatMessages])

    useEffect(() => {
        setRefs(currentChatMessages?.map(() => createRef()))
        console.log('1', currentChatMessages?.map(() => createRef()))
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

    const setIsAnswerModeCallback = (m) => {
        inputRef.current.focus()
        setMessageToAnswerId(m.id)

    }

    const setMessagesCallback = (message) => {
      dispatch(setMessages(messages.map(m => m.id === message.id ? message : m)))
    }

    if (isMessageLoading || typeof companionData?.id === 'undefined' || (!refs && currentChatMessages && currentChatMessages.length > 0)) return <div><div>Loading...</div><div>{isMessageLoading && 'first'} {!companionData?.id && 'second'}</div></div>

    return (
        <div style={{"display": "flex"}}>
            {
                isDeleteMode && <div style={{"position": "absolute", "left": "40%", "top": "20%", "width": "20%", "height": "60%"}} ref={deleteModalRef}>
                    <div>Delete messages?</div>
                    <div onClick={() => onDeleteClick('1')}>Delete for everyone</div>
                    <div onClick={() => onDeleteClick('2')}>Delete from me</div>
                    <div onClick={() => setIsDeleteMode(false)}>Cancel</div>
                </div>
            }
            {isUserChoiceModalOpened &&
            <div style={{"position": "absolute", "left": "40%", "top": "20%", "width": "20%", "height": "60%"}}>
                <div style={{"background": "green", "color": "white", "height": "30px", "display": "flex"}}>
                    <span>Cancel</span>
                    <span>Resend messages</span>
                </div>
                <input onChange={e => onSearchInputChange(e.currentTarget.value)}/>

                <div>
                    {foundUsersFromUserSearch.map(u => <div style={{"display": "flex"}}>
                        <input
                            type={"checkbox"}
                            checked={!!selectedUsersToResendMessages.find(fu => fu.id === u.id)}
                            onChange={e => setSelectedUsersToResendMessages(s => e.target.checked ? [...s, u] : s.filter(fu => fu.id !== u.id))}
                        />
                        <img
                            src={
                                avatar ?
                                    baseURL + avatar
                                    :
                                    AVATAR
                            }
                            className={'avatar'}
                        />
                        <span>{u.username ?? u.name}</span>
                    </div>)}
                </div>
                {selectedUsersToResendMessages.length !== 0 &&
                    <div style={{"display": "flex", "justifyContent": "space-between"}}>
                    <span>{selectedUsersToResendMessages.map(u => u.username).reverse().join(', ')}</span>
                    <span onClick={onSend}>Send</span>
                </div>}
            </div>}
            <div>
                <div className={'chat_panel'} onClick={() => setIsProfileShowed(true)} style={{display: "flex", alignItems: "center"}}>
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
                        currentChatMessagesState?.map((m, i) => {//m.resent
                            const messageToAnswer = m.message_to_answer_id ? m.resent ? messages.find(mm => mm.id === m.message_to_answer_id) : currentChatMessages.find(mm => mm.id === m.message_to_answer_id) : null
                            const messageToAnswerFromUsername = m.message_to_answer_id ? users.find(u => u.id === messageToAnswer.from_user_id).username : null
                            const date = new Date(m.time)
                            const day = date.getDate()
                            const month = date.toLocaleString('default', { month: 'long' })
                            const dataForUser = `${day} ${month}`
                            return <div>
                                {firstUnreadMessageId === i && <div>Unread messages</div>}
                                {
                                    (
                                        (currentChatMessages && !currentChatMessages[i - 1])
                                        ||
                                        (currentChatMessages && currentChatMessages[i - 1] && m.time.split('T')[0] !== currentChatMessages[i - 1].time.split('T')[0])
                                    ) && <div className={'message_data_label'}>{dataForUser}</div>
                                }
                                <div style={{"display": "flex"}}>
                                    {isSelectMode && <input
                                        type={"checkbox"}
                                        onChange={e => onSelectMessage(e, m)}
                                        checked={!!selectedMessages.find(sm => sm.id === m.id)}
                                    />}
                                    <Message
                                        messageToAnswerFromUsername={messageToAnswerFromUsername}
                                        messageToAnswer={messageToAnswer}
                                        currentChatMessages={currentChatMessages}
                                        i={i}
                                        m={m}
                                        companionData={companionData}
                                        username={user.username}
                                        firstUnreadMessageId={firstUnreadMessageId}
                                        messageRef={refs[i]}
                                        usernameOrGroupName={usernameOrGroupName}
                                        setIsAnswerModeCallback={setIsAnswerModeCallback}
                                        users={users}
                                        setSelectedInfoMessage={setSelectedInfoMessage}
                                        setIsSelectMode={setIsSelectMode}
                                        setIsDeleteMode={setIsDeleteMode}
                                        setSelectedMessage={setSelectedMessage}
                                        deleteModalRef={deleteModalRef}
                                        setMessagesCallback={setMessagesCallback}
                                        setModalPhotoCallback={setModalPhotoCallback}
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>

                <div className={'chat_panel'}>
                    {!!messageToAnswerId &&
                        <div style={{"padding": "5px", background: "gray"}}>
                        <div>{messageToAnswer.username}</div>
                        <div>{messageToAnswer.text}</div>
                        <div onClick={() => setMessageToAnswerId(0)}>Cancel</div>
                    </div>}
                    {
                        isSelectMode &&
                        <div style={{"display": "flex", "justifyContent": "space-between"}}>
                        <div>
                        <span onClick={() => setIsSelectMode(false)}>Cancel</span>
                        <span>Selected: {selectedMessages.length}</span>
                        </div>

                        <div>
                            <span>Favorites</span>
                            <span>Delete</span>
                            <span onClick={onOpenUserChoiceModal}>Resend</span>
                        </div>
                        </div>
                    }
                    <div>
                        {
                            addedImages.map(i => <img src={i}/>)
                        }
                    </div>
                    <input type={"file"} multiple accept={'image/*'} ref={fileInputRef} onChange={onFileInputChange}/>
                    {isMoreOpened && <div ref={moreMenuRef}>
                        <span>
                            <span>Photos</span>
                        </span>
                    </div>}
                    <span onClick={onMoreClick}>More</span>
                    <input ref={inputRef} value={text} onChange={e => onEnterMessageChange(e.currentTarget.value)} onKeyDown={onKeyDownHnd}/>
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
            {
                Object.keys(selectedInfoMessage).length > 0 &&
                <DataAboutMessage
                    setIsAnswerModeCallback={setIsAnswerModeCallback}
                    messageToAnswer={messageToAnswerOfMessageInInfoMode}
                    username={user.username}
                    selectedInfoMessage={selectedInfoMessage}
                    setSelectedInfoMessage={setSelectedInfoMessage}
                />
            }
        </div>
    );
};

export default SelectedCompanionMessenger;