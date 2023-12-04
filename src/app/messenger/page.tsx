'use client'

import {useRouter, useSearchParams} from "next/navigation";
import cookie from "js-cookie";
import {useEffect, useMemo, useRef, useState} from "react";
import {getDataString} from "@/fn/getDataString";
import {inst, baseURL, AVATAR} from "@/const/const";
import {useDispatch, useSelector} from "react-redux";
import {addMessages, setIsMessageLoading} from "@/store/slices/messageSlice";
import {
    addUser,
    changeUsersStatus,
    setCompanionData,
    setHasRefInitialized,
    setUserId,
    setUsers
} from "@/store/slices/userSlice";
import {addGroup, addGroups, setGroups} from "@/store/slices/groupSlice";
import {Chat} from "@/components/chat/Chat";
import {Message} from "@/components/Message";
import SelectedCompanionMessenger from "@/components/selectedCompanionMessanger/SelectedCompanionMessenger";
import {DataAboutMessage} from "@/components/dataAboutMessage/DataAboutMessage";

export default function Index() {
    const dispatch = useDispatch()
    const { get } = useSearchParams()

    const { users, userId } = useSelector(state => state.userData)
    const groups = useSelector(state => state.groupData.groups)

    const user = users.find(u => u.id === Number(userId))

    const { messages } = useSelector(state => state.messageData)

    const { push } = useRouter()



    const [leftNavState, setLeftNavState] = useState('noSearch')

    const [usersFromSearch, setUsersFromSearch] = useState([])

    const [isMenuShowed, setIsMenuShowed] = useState(false)

    const [leftSideBarState, setLeftSideBarState] = useState('users')

    const [isMoreInSettingsShowed, setIsMoreInSettingsShowed] = useState(false)

    const [isWriteListOpened, setIsWriteListOpened] = useState(false)

    const [selectedUsersForNewGroup, setSelectedUsersForNewGroup] = useState([])

    const [newGroupName, setNewGroupName] = useState('')

    const [newGroupCreationInputValue, setNewGroupCreationInputValue] = useState('')

    const [writingUsers, setWritingUsers] = useState([])

    const [writingUserGroups, setWritingUserGroups] = useState([])

    const [groupShowedWritingUsers, setGroupShowedWritingUsers] = useState([])

    const userIdFromUrl = get('user-id');
    const groupIdFromUrl = get('group-id');

    const chats = useMemo(() => {
        let chats = []
        for (let i = 0; i < messages.length; i++) {
            if (chats.length === 0) {
                chats.push([messages[i]])
                continue
            }
            else if (messages[i].group_id) {
                for (let j = 0; j < chats.length; j++) {
                    if (chats[j][0].group_id === messages[i].group_id) {
                        chats[j].push(messages[i])
                        break
                    }
                    else if (j === chats.length - 1) {
                        chats.push([messages[i]])
                        break
                    }
                }
            } else {
                for (let j = 0; j < chats.length; j++) {
                    if (
                        (
                            chats[j][0].from_user_id === messages[i].from_user_id
                            &&
                            chats[j][0].to_user_id === messages[i].to_user_id
                        )
                        ||
                        (
                            chats[j][0].to_user_id === messages[i].from_user_id
                            &&
                            chats[j][0].from_user_id === messages[i].to_user_id
                        )
                    ) {
                        chats[j].push(messages[i])
                        break
                    }
                    // if (chats.length - 1 === j) chats.push([messages[i]])
                    else if (j === chats.length - 1) chats.push([messages[i]])
                }
            }

        }

        for (let i = 0; i < chats.length; i++) {
            chats[i].sort((a, b) => new Date(a.time) - new Date(b.time))
        }

        chats.sort((a, b) => new Date(b.slice(-1)[0].time) - new Date(a.slice(-1)[0].time))

        return chats
    }, [messages])

    const ref = useRef(null)

    const logOutBtnRef = useRef(null)

    const modalPhotoRef = useRef(null)

    const pageRef = useRef(null)
    const [modalPhotoSrc, setModalPhotoSrc] = useState('')

    useEffect(() => {
    }, [messages])
    useEffect(() => {
        inst.get('/groups_and_users')
            .then(( { data: { groups, users } } ) => {
                // setIsUsersLoading(false)
                dispatch(setUsers(users))
                dispatch(setGroups(groups))
            })

        const intervalId = setInterval(() => {
            inst.get('/users/get-user-statuses')
                .then(res => {
                    if (res.data.length > 0) {
                        dispatch(changeUsersStatus(res.data))
                    }
                })
        }, 10000)
        if (!userId) dispatch(setUserId(Number(cookie.get('userId'))))
        return () => {
            clearInterval(intervalId)
        }

    }, [])

    useEffect(() => {
        if (userId) {
            inst.get('/messages/get-user-messages/' + userId)
                .then(({data}) => {
                    // setIsMessagesLoading(false)
                    dispatch(addMessages(data))
                    dispatch(setIsMessageLoading(false))
                })
        }
        const beforeUnloadHandler = () => {
            inst.post(`/users/${userId}/update-status`, {isOnline: false, lastOnlineDate: getDataString(), userId})
        }
            window.addEventListener('beforeunload', beforeUnloadHandler)

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler)
        }

    }, [userId])

    const usersFromUserMessenger = chats.map(c => {
        if (c[0].group_id) {
            return groups.find(g => g.id === c[0].group_id)
        } else {
            if (c[0].to_user_id !== Number(userId)) {
                return users.find(u => u.id === c[0].to_user_id)
            } else {
                return users.find(u => u.id === c[0].from_user_id)
            }
        }
    })

    useEffect(() => {
        if (selectedUsersForNewGroup.length === 0 && user) setSelectedUsersForNewGroup([user])
    }, [user])

    useEffect(() => {
        if (users) setWritingUsers(users.filter(u => u.is_writing))
    }, [users])

    useEffect(() => {
        if (!groupIdFromUrl) return () => {}
        const intervalId = setInterval(() => {
            let writingUserGroupsCopy = [...writingUserGroups]
            let groupShowedWritingUsersCopy = [...groupShowedWritingUsers]
            for (let i = 0; i < chats.length; i++) {
                const currentChatMessages = chats.find(c => c[0]?.group_id === Number(groupIdFromUrl))
                const currentChatLastMessage = currentChatMessages.slice(-1)[0]
                let writingGroupUsers = writingUsers.filter(u =>
                    (currentChatLastMessage.to_user_ids.includes(u.id) || currentChatLastMessage.from_user_id === u.id)
                    && u.is_writing
                    && u.id !== Number(userId)
                )
                groupShowedWritingUsersCopy[i] = null
                writingUserGroupsCopy[i] = []
                let newWritingUser
                if (!writingGroupUsers) break
                else if (writingGroupUsers.length < 2) {
                    if (writingGroupUsers.length === 1) {
                        newWritingUser = writingGroupUsers[0]
                        groupShowedWritingUsersCopy[i] = newWritingUser
                    }

                    writingUserGroupsCopy[i] = writingGroupUsers

                } else {
                    const randomIndex = Math.floor(Math.random() * writingGroupUsers.length)

                    newWritingUser = writingGroupUsers[randomIndex]
                    writingUserGroupsCopy[i] = writingGroupUsers
                    groupShowedWritingUsersCopy[i] = newWritingUser
                }
            }
            setWritingUserGroups(writingUserGroupsCopy)
            setGroupShowedWritingUsers(groupShowedWritingUsersCopy)
        }, 2000)

        return () => {
            clearInterval(intervalId)
        }
    }, [chats, writingUserGroups,groupShowedWritingUsers, groupIdFromUrl, writingUsers])

    useEffect(() => {
        if (groupShowedWritingUsers.length === 0 || writingUserGroups.length === 0) {
            setGroupShowedWritingUsers(chats.map(c => null))
            setWritingUserGroups(chats.map(c => []))
        }
    }, [chats])

    const onNewGroupCreatingInputChange = (v) => {
        setNewGroupCreationInputValue(v)
        onSearchInputChange(v)
    }

    const onCreateGroup = v => {
        inst.post('/groups', {userIds: selectedUsersForNewGroup.map(u => u.id), createdAt: getDataString(), newGroupName})
            .then(res => {
                const newGroup = res.data
                const time = getDataString()
                const text = `User ${user.username} created a chat`
                const isRead = !!users.filter(u => newGroup.user_ids.includes(u.id)).find(u => !u.is_online && u.id !== Number(userId))
                const to_user_ids = newGroup.user_ids.filter(u => u.id !== user.id)
                const from_user_id = user.id
                const group_id = newGroup.id

                inst.post('/messages', {time, text, isRead, from_user_id, to_user_ids, group_id})
                dispatch(addGroup(newGroup))
                dispatch(setCompanionData(newGroup))
                setLeftSideBarState('users')
                push('/messenger?group-id=' + newGroup.id)
            })
    }

    const onSearchInputChange = async (v) => {
        if (v.length > 3) {
            const { data: foundUsers } = await inst.get('/users/find-users', {params: { v }})

            setUsersFromSearch(foundUsers)
        }  else {
            const foundUsers = usersFromUserMessenger?.filter(u => u.first_name.startsWith(v) ||
                    u.second_name.startsWith(v) ||
                    u.username.split('_').map(s => s.startsWith(v)).some(bool => bool)
            ) ?? []

            setUsersFromSearch(foundUsers)
        }

        const foundMessages = messages.filter(m => m.text.includes(v))
        if (leftNavState === 'searchInputIsFocused' && v.length > 0) setLeftNavState('search')
        else if (v.length === 0) setLeftNavState('searchInputIsFocused')


    }

    const onSearchInputFocus = (v) => {
      if (leftNavState === 'noSearch') setLeftNavState('searchInputIsFocused')
    }

    const onFoundUserClickHandler = (u) => {
        const found_user_chats = user.found_chat_from_search_ids
        // const found_user_chats = user.JSON.parse(user.found_chat_from_search_ids)
        const fc = found_user_chats[0]
        if ((found_user_chats !== 0) || (fc?.id !== u.id || fc?.is_group === !!u.name)) {
            let newUsers = [...users]

            if (found_user_chats.find(c => c.is_group === !!u.name && c.id === u.id || found_user_chats.length !== 0)) { //user.found_chat_from_search_ids.includes(u.id)
                newUsers = users.map(mu =>
                    mu.id === user.id ?
                        {...user, found_chat_from_search_ids: found_user_chats.filter(c => c.id_group === !!u.name && c.id !== u.id)}
                        :
                        mu
                )
            }
            let ids = [...newUsers.find(u => u.id === user.id).found_chat_from_search_ids]
            ids.unshift({id: u.id, is_group: !!u.name})

            inst.put('/users/update-recent', { ids })
                .then(() => {
                 dispatch(setUsers(newUsers))
                })
        }
        dispatch(setCompanionData(u))
        dispatch(setHasRefInitialized(false))
        push(`/messenger?${u.username ? 'user-id' : 'group-id'}=` + u.id)
    }
    
    const handleClick = (e) => {
      if (logOutBtnRef.current && !logOutBtnRef.current.contains(e.target)) {
          document.removeEventListener('click', handleClick)
          document.removeEventListener('mousemove', handleMouseMove)
          setIsMoreInSettingsShowed(false)
      }
    }

    const handleMouseMove = (event) => {
        if (logOutBtnRef.current) {
            const { left, top, width, height } = logOutBtnRef.current.getBoundingClientRect();
            const { clientX, clientY } = event;

            // Вычисляем расстояние между курсором и элементом
            const distance = Math.sqrt(
                Math.pow(clientX - left - width / 2, 2) +
                Math.pow(clientY - top - height / 2, 2)
            );

            // Проверяем, удален ли курсор на расстояние >= 100px от элемента
            if (distance >= 100) {
                document.removeEventListener('click', handleClick)
                document.removeEventListener('mousemove', handleMouseMove)
                setIsMoreInSettingsShowed(false);
            }
        }
    };
    
    const obMoreInSettingsClickHandler = () => {
        if (!isMoreInSettingsShowed) {
            document.addEventListener('click', handleClick)
            document.addEventListener('mousemove', handleMouseMove)
            setIsMoreInSettingsShowed(true)
        }
    }

    const onRecentSearchUserClickHandler = (u) => {
        dispatch(setCompanionData(u))
        push('/messenger?user-id=' + u.id)
    }

    const onCheckboxChange = (c, u) => {
        setNewGroupCreationInputValue('')
        setSelectedUsersForNewGroup(s => c ? [...s, u] : s.filter(mu => mu.id !== u.id))
    }

    const companionId = useMemo(() => userIdFromUrl || groupIdFromUrl, [userIdFromUrl, groupIdFromUrl])

    const x = (e) => {
      if (!modalPhotoRef.current.contains(e.target)) {
          document.removeEventListener("click", x)
          pageRef.current.style.background = ''
          setModalPhotoSrc('')
      }
    }

    const setModalPhotoCallback = (url) => {
        if (!modalPhotoSrc) {
        setModalPhotoSrc(`${baseURL}${url}`)
            pageRef.current.style.background = 'rgba(0, 0, 0, 0.7)'

            // modalPhotoRef.current.style.zIndex = '3'
        document.addEventListener("click", x)
        }
    }

    if (!user) return <div>Loading</div>

    return <div>
        {modalPhotoSrc &&
            <div>
            <img
                style={{position: "absolute", width: '64%', height: '68%', left: '19%', top: '16%', zIndex: '10'}}
                ref={modalPhotoRef}
                src={modalPhotoSrc}
            />
            <div style={{position: "absolute", width: '100%', height: '100%', background: "#000", opacity: '80%', zIndex: "9"}}>
            </div>
            </div>}
        <div style={{display: "flex"}} ref={pageRef}>


        <div>
            {
                leftSideBarState === 'createNameForNewGroup' && <div>
                <input placeholder={'Enter name...'} onChange={e => setNewGroupName(e.currentTarget.value)}/>
                <button onClick={onCreateGroup}>Create group</button>
                </div>
            }
            {
                leftSideBarState === 'addUsers' && <div>
                <div>
                <div onClick={() => setLeftSideBarState('users')}>Back</div>
                <div>Add Members</div>
                </div>
                <div>{selectedUsersForNewGroup.map(u => <div>{u.username ?? u.name}</div>)}</div>
                <input placeholder={'Add people...'} value={newGroupCreationInputValue} onChange={e => onNewGroupCreatingInputChange(e.currentTarget.value)}/>

                    <div>
                        {
                            usersFromSearch.map(u => <div
                                style={{display: "flex"}}
                                // onClick={() => onFoundUserClickHandler(u)}
                            >
                                <input
                                    type={'checkbox'}
                                    onChange={e => onCheckboxChange(e.currentTarget.checked, u)}
                                    checked={selectedUsersForNewGroup.find(mu => mu.id === u.id)}
                                />
                                <img className={'avatar'}
                                     src={u.avatar_photo_urls?.slice(-1)[0] ? `${baseURL}${u.avatar_photo_urls.slice(-1)[0]}` : AVATAR /*baseURL + u.avatar_photo_urls.slice(-1)[0] ?? ''*/}/>
                                <div>
                                    <div>{u.first_name} {u.second_name}</div>
                                    <div>{u.username}</div>
                                </div>
                            </div>)
                        }
                    </div>

                <div onClick={() => setLeftSideBarState('createNameForNewGroup')}>Next</div>


                </div>
            }
            {
                leftSideBarState === 'users' && <div style={{background: "brown", position: "relative"}}>
                    <div style={{display: "flex", justifyContent: "space-between", margin: '0 3px'}}>
                        {(leftNavState === 'search' || leftNavState === 'searchInputIsFocused') &&
                            <div onClick={() => setLeftNavState('noSearch')}>can</div>}
                        {leftNavState === 'noSearch' && <div>
                            <div onClick={() => setIsMenuShowed(s => !s)}>More</div>
                            {isMenuShowed && <div>
                                <div onClick={() => setLeftSideBarState('settings')}>Settings</div>
                            </div>}
                        </div>}
                        <input
                            onChange={e => onSearchInputChange(e.currentTarget.value)}
                            onFocus={e => onSearchInputFocus(e.currentTarget.value)}
                            placeholder={'Search'} style={{width: '70%', borderRadius: '12px'}}
                            ref={ref}
                        />
                    </div>
                    {leftNavState === 'search' && usersFromSearch.length > 0 && <div>
                        <div>
                            {
                                usersFromSearch.map(u => <div style={{display: "flex"}}
                                                              onClick={() => onFoundUserClickHandler(u)}>
                                    <img className={'avatar'}
                                         src={u.avatar_photo_urls?.slice(-1)[0] ? `${baseURL}${u.avatar_photo_urls.slice(-1)[0]}` : AVATAR /*baseURL + u.avatar_photo_urls.slice(-1)[0] ?? ''*/}/>
                                    <div>
                                        <div>{u.first_name} {u.second_name}</div>
                                        <div>{u.username}</div>
                                    </div>
                                </div>)
                            }
                        </div>
                        <div>
                            {/*                    {
                        messagesFromSearch.map(m => <div>
                            <img src={}/>
                        </div>)
                    }*/}
                        </div>
                    </div>
                    }
                    {leftNavState === 'searchInputIsFocused' && <div>
                        <div style={{overflow: "auto", width: '100%'}}>
                            {
                                    chats.map(([ m ], i) => {
                                        let u

                                        if (m.group_id) {
                                            u = groups.find(g => g.id === m.group_id)
                                        } else {
                                            const uId = m.from_user_id === Number(userId) ? m.to_user_id : m.from_user_id

                                            u = users.find(u => u.id === uId)
                                        }


                                        const avatar = u.avatar_photo_urls?.slice(-1)[0] ?? u.avatar_urls?.slice(-1)[0]
                                        const name = u.first_name ??  u.name

                                        const writingUser = chats[i].find(u => u.is_writing)
                                        const isGroup = chats[i].length > 1

                                        return <div onClick={() => onFoundUserClickHandler(u)}>
                                            <img className={'avatar'} src={avatar ? `${baseURL}${avatar}` : AVATAR} />
                                            <div>{name}</div>
                                            {writingUser && <div>{isGroup && writingUser.username} writing...</div>}
                                        </div>
                            }
                                    )
                            }

                        </div>
                        <div>
                            <div>Recent</div>
                            {
                                user.found_chat_from_search_ids?.map(({id, is_group}) => {
                                     const u = is_group ? groups.find(u => u.id === id) : users.find(u => u.id === id)
                                    const isUser = !!u.username
                                    const avatar_urls = isUser ? u.avatar_photo_urls : u.avatar_urls
                                    const name = isUser ? `${u.first_name} ${u.second_name}` : u.name
                                    return <div onClick={() => onRecentSearchUserClickHandler(u)}>
                                        <img
                                            className={'avatar'}
                                            src={avatar_urls?.slice(-1)[0] ? baseURL + avatar_urls.slice(-1)[0] : AVATAR}
                                        />

                                        <span>{name}</span>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    }
                    {leftNavState === 'noSearch' && <div>
                        {
                            chats.map(([ m ], i) => <Chat
                                i={i}
                                m={m}
                                groups={groups}
                                users={users}
                                user={user}
                                chats={chats}
                                onFoundUserClickHandler={onFoundUserClickHandler}
                                writingUser={groupShowedWritingUsers[i]}
                                groupIdFromUrl={groupIdFromUrl}
                                />
                            )
                        }

                    </div>
                    }
                    <div>
                    <div onClick={() => setIsWriteListOpened(s => !s)}>Write</div>
                        {
                            isWriteListOpened && <div>
                            <div onClick={() => setLeftSideBarState('addUsers')}>New group</div>
                        </div>
                        }
                    </div>
                </div>
            }
            {
                leftSideBarState === 'settings' && <div>
                <div>
                    <span onClick={() => setLeftSideBarState('users')}>Back</span>
                    <span>Settings</span>
                    <div style={{display: "flex", flexDirection: "column"}}>
                    <div onClick={obMoreInSettingsClickHandler}>More</div>
                        {isMoreInSettingsShowed && <div ref={logOutBtnRef}>Log Out</div>}
                    </div>
                </div>
                </div>
            }

        </div>
        {companionId &&
            <SelectedCompanionMessenger
                groups={groups}
                users={users}
                user={user}
                chats={chats}
                groupShowedWritingUsers={groupShowedWritingUsers}
                messages={messages}
                usersFromUserMessenger={usersFromUserMessenger}
                setModalPhotoCallback={setModalPhotoCallback}
            />
        }
    </div>
    </div>
}