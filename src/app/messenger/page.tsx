'use client'

import {useRouter, useSearchParams} from "next/navigation";
import cookie from "js-cookie";
import {createRef, useEffect, useMemo, useRef, useState} from "react";
import {getDataString} from "@/fn/getDataString";
import {inst, baseURL, AVATAR, userId} from "@/const/const";
import {useDispatch, useSelector} from "react-redux";
import {addMessage, addMessages, setIsMessageLoading, setMessages, setReadMessage} from "@/store/slices/messageSlice";
import {addUser, changeUsersStatus, setUsers} from "@/store/slices/userSlice";
import {addGroup, addGroups, setGroups} from "@/store/slices/groupSlice";
import {Chat} from "@/components/chat/Chat";
import {Message} from "@/components/Message";

export default function Index() {
    const dispatch = useDispatch()
    const { get } = useSearchParams()

    // if (!userId) return <div>Loading...</div>

    const users = useSelector(state => state.userData.users)
    const groups = useSelector(state => state.groupData.groups)

    const user = users.find(u => u.id === Number(userId))

    const { messages, isMessageLoading } = useSelector(state => state.messageData)

    const { push } = useRouter()

    const [text, setText] = useState('')

    const [hasRefInitialized, setHasRefInitialized] = useState(false)

    const [leftNavState, setLeftNavState] = useState('noSearch')

    const [usersFromSearch, setUsersFromSearch] = useState([])

    const [usersFromNewGroupMemberSearch, setUsersFromNewGroupMemberSearch] = useState([])

    const [messagesFromSearch, setMessagesFromSearch] = useState([])

    const [allUsers, setAllUsers] = useState()

    const [isMenuShowed, setIsMenuShowed] = useState(false)

    const [leftSideBarState, setLeftSideBarState] = useState('users')

    const [isMoreInSettingsShowed, setIsMoreInSettingsShowed] = useState(false)

    const [companionData, setCompanionData] = useState({})

    const [currentChatMessagesState, setCurrentChatMessagesState] = useState([])

    const [isWriteListOpened, setIsWriteListOpened] = useState(false)

    const [selectedUsersForNewGroup, setSelectedUsersForNewGroup] = useState([])

    const [newGroupName, setNewGroupName] = useState('')

    const [typingUserChats, setTypingUserChats] = useState([]) //type chat users

    const [newGroupCreationInputValue, setNewGroupCreationInputValue] = useState('')

    const [writingUsers, setWritingUsers] = useState([])

    const [writingUser, setWritingUser] = useState({})

    const [writingGroupUsers, setWritingGroupUsers] = useState([])

    const [writingUserGroups, setWritingUserGroups] = useState([])

    const [groupShowedWritingUsers, setGroupShowedWritingUsers] = useState([])

    const [currentCompanionId, setCurrentCompanionId] = useState(0)

    const [isProfileShowed, setIsProfileShowed] = useState(false)

    const [isAddMembersToGroupModalShowed, setIsAddMembersToGroupModalShowed] = useState(false)

    const [isDeleteMemberModalShowed, setIsDeleteMemberModalShowed] = useState(false)

    const usernameOrGroupName = companionData.username ?? companionData.name

    // const currentChatMessages = useMemo(() => {
    //     // const filteredAndSortedMessages = messages
    //     //     .filter(m =>
    //     //         (m.from_user_id === companionData.id || m.to_user_id === companionData.id) &&
    //     //         (m.from_user_id === Number(userId) || m.to_user_id === Number(userId))
    //     //     )
    //     //     .sort(compareMessagesByDate)
    //     // debugger
    //     return filteredAndSortedMessages
    //
    // }, [messages, companionData])
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

    // console.log(get('user-id'), get('group-id'))



    const ref = useRef(null)

    const logOutBtnRef = useRef(null)

    useEffect(() => {
        // console.log('changed currChatMess')
        setCurrentChatMessagesState(currentChatMessages)
    }, [currentChatMessages])
    const isUserCurrentChat = useMemo(() => !!get('user-id'), [!!get('user-id')])

    // useEffect(() => {
    //     console.log(currentChatMessages)
    // }, [currentChatMessages])

    useEffect(() => {
        const isUserCurrentChat = !!get('user-id')
        const companionIdFromState = get(isUserCurrentChat ? 'user-id' : 'group-id')
        const stateOfSearch = isUserCurrentChat ? users : groups
        const companionFromState = stateOfSearch.find(u => u.id === Number(companionIdFromState))
            if (!companionFromState) {
                if (isUserCurrentChat) {
                    inst.get('/users/get-user/' + get('user-id'))
                        .then(res => {
                            setCompanionData(res.data.user)
                            dispatch(addUser(res.data.user))
                        })
                } else {
                    inst.get('/groups/get-group/' + get('group-id'))
                        .then(res => {
                            setCompanionData(res.data)
                            dispatch(addGroup(res.data))
                        })
                }


                // inst.get('/users/get-user/' + get('user-id')).then(( res  => {
                //     console.log('user', res.data.user, res.data)
                //     setCompanionData(res.data.user)
                //     dispatch(addUsers(res.data.user))
                // }))
            } else if (companionFromState && companionData.id !== companionFromState.id) {
                setCompanionData(companionFromState)
            }
    }, [users, groups, isUserCurrentChat])

    // window.messages = messages
    // window.users = users

    // console.log('chats', chats)
    // console.log('users', users)
    // console.log('messages', messages)
    // console.log('usersFromSearch', usersFromSearch)
    // console.log('chats', chats)
    useEffect(() => {
    }, [messages])
    useEffect(() => {
        getAndSetAllUsers()
        if (get('user-id')) getMessages()

        // if (users.length === 0 || messages.length === 0) {
        inst.get('/groups_and_users')
            .then(( { data: { groups, users } } ) => {
                // setIsUsersLoading(false)
                dispatch(setUsers(users))
                dispatch(setGroups(groups))
            })

        inst.get('/messages/get-user-messages/' + userId)
            .then(({data}) => {
                // setIsMessagesLoading(false)
                dispatch(addMessages(data))
            })
        // inst.get('/groups')
        //     .then(res => {
        //         dispatch(addGroups(res.data))
        //     })

        // }

        // inst.post(`/users/${userId}/update-status`, {isOnline: true})
        //     .then(() => {
        //         const updatedUsers = users.map(u => u.id === Number(userId) ? {...u, is_online: true} : u)
        //         console.log('2')
        //         dispatch(setUsers(updatedUsers))
        //     })

        window.addEventListener('beforeunload', () => {
            inst.post(`/users/${userId}/update-status`, {isOnline: false, lastOnlineDate: getDataString()})
        })


        const intervalId = setInterval(() => {
            inst.get('/users/get-user-statuses')
                .then(res => {
                    if (res.data.length > 0) {
                        // const updatedUsers = users.map(u => res.data.map(u => u.id).includes(u.id) ? {...u, is_writing: !u.is_writing} : u)
                        // dispatch(setUsers(updatedUsers))
                        dispatch(changeUsersStatus(res.data))
                    }
                })
        }, 1000)
        return () => {
            clearInterval(intervalId)
        }

    }, [])


    useEffect(() => {
        const intervalId = setInterval(() => {
            if (companionData.id && usernameOrGroupName && isUserCurrentChat) {
                inst.get(`/users/${companionData.id}/get-user-status`)
                    .then(res => {
                        if (res.data.isOnline !== companionData.is_online) {
                            const updatedUsers = users.map(u => u.id === companionData.id ? {...u, is_online: res.data.isOnline} : u)
                            setCompanionData(u => ({...u, is_online: res.data.isOnline}))
                            dispatch(setUsers(updatedUsers))
                        } else if (res.data.isWriting !== companionData.is_writing) {
                            const updatedUsers = users.map(u => u.id === companionData.id ? {...u, is_writing: res.data.isWriting} : u)
                            setCompanionData(u => ({...u, is_writing: res.data.isWriting}))
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

        }, 5000)

        return () => {
            clearInterval(intervalId)
        }
    }, [companionData, messages, isUserCurrentChat])

    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         if (writingGroupUsers.length < 2) {
    //             if (writingGroupUsers.length === 1) setWritingUser(writingGroupUsers[0])
    //
    //             setWritingGroupUsers(writingUsers.find(u => currentChatMessages.slice(-1)[0].to_user_ids.includes(u.id) && u.is_writing))
    //         } else {
    //             const newWritingGroupUsers = writingGroupUsers.filter(u => u.id !== writingUser.id)
    //             const randomIndex = Math.floor(Math.random() * newWritingGroupUsers.length)
    //
    //             setWritingUser(writingGroupUsers[randomIndex])
    //             setWritingGroupUsers(newWritingGroupUsers)
    //         }
    //
    //
    //
    //         const groupWritingUsers = writingUsers.filter(u => currentChatMessages.slice(-1)[0].to_user_ids.includes(u.id) && u.is_writing)
    //         if (groupWritingUsers.length > 1) {
    //
    //         }
    //     }, 2000)
    //
    //     return () => {
    //         clearInterval(intervalId)
    //     }
    // }, [])

    let currentChatIndex

    useEffect(() => {
        if (chats && currentChatMessagesState && currentChatMessagesState[0]) currentChatIndex = chats.indexOf(chats.find(c => c[0].id === currentChatMessagesState[0].id))
    }, [chats, currentChatMessagesState])

    const getAndSetAllUsers = async () => {
        const { data: { rows: users } } = await inst.get('/users?count=5')

        setAllUsers(users)
    }

    const getMessages = async () => {
        setIsMessageLoading(true)
        const params = {firstUserId: cookie.get('userId'), secondUserId: get('user-id')}

         const { data: messages } = await inst.get('/messages', { params })

        dispatch(addMessages(messages))

        setIsMessageLoading(false)
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

    const userIdsFromUserMessenger = messages.map(u => u.from_user_id === userId ? u.to_user_id : u.from_user_id)
    const groupsFromUserMessenger = messages.reduce((acc, curr) => {
        return curr.group_id && !acc.includes(curr.group_id) ? [...acc, curr] : acc
    }, [])
    const usersFromUserMessenger = users
        .filter(u => userIdsFromUserMessenger.includes(u.id))
        .filter(u => u.id !== Number(userId))

    const groupsAndUsers = [...groupsFromUserMessenger, ...usersFromUserMessenger]

    const onKeyDownHnd = (e) => {
      if (e.key === 'Enter') {
          sendMessageHnd()
      }
    }

    // const refs = currentChatMessages.map(() => createRef())

    const [refs, setRefs] = useState([])
    // let refs

    useEffect(() => {
        setRefs(currentChatMessages?.map(() => createRef()))
        // refs = currentChatMessages?.map(() => createRef())
    }, [currentChatMessages])

    const messageListRef = useRef(null)

    const addMembersInputRef = useRef(null)

    let firstUnreadMessageId = -1

    if (currentChatMessages) {
        currentChatMessages.map((m, i) => {
            if (!m.read && m.from_user_id !== Number(userId) && firstUnreadMessageId === -1) firstUnreadMessageId = i
        })
    }

    const scrollToUnread = () => {
        setHasRefInitialized(true)


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

    useEffect(() => {
        if (!hasRefInitialized && messageListRef.current && refs && refs[0] && refs[0].current) scrollToUnread()
    }, [messageListRef.current, refs])

    useEffect(() => {
        if (messageListRef.current) {
            setTimeout(() => {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }, 0);
        }
    }, [messageListRef.current && messageListRef.current.scrollHeight, currentChatMessagesState])

    useEffect(() => {
        refs?.map((elementRef, i) => {
            const options = {
                root: null, // Корневой элемент (null - окно браузера)
                rootMargin: '0px', // Граница корневого элемента
                threshold: 0.5, // Порог видимости (0.5 - элемент половину виден)
            };

            const observer = new IntersectionObserver((e) => handleIntersection(e, i), options);

            if (elementRef.current) {
                observer.observe(elementRef.current);
            }

            return () => {
                if (elementRef.current) {
                    observer.unobserve(elementRef.current);
                }
            };
        })

    }, [refs]);

    const handleIntersection = (entries, i) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Элемент появился на экране
                // Вы можете выполнить здесь нужные действия
                //console.log('Элемент появился на экране');
                if (!currentChatMessages[i].read && currentChatMessages[i].from_user_id !== Number(userId)) {
                    inst.put('/messages/' + i).then(() => dispatch(setReadMessage(i)))
                }
            }
        });
    };





    /////////////

    useEffect(() => {
        if (selectedUsersForNewGroup.length === 0 && user) setSelectedUsersForNewGroup([user])
    }, [user])

    useEffect(() => {
        if (users) setWritingUsers(users.filter(u => u.is_writing))
    }, [users])

    useEffect(() => {
        const intervalId = setInterval(() => {
            let writingUserGroupsCopy = [...writingUserGroups]
            let groupShowedWritingUsersCopy = [...groupShowedWritingUsers]
            for (let i = 0; i < chats.length; i++) {
                let writingGroupUsers = writingUserGroupsCopy[i]
                let writingUser = groupShowedWritingUsersCopy[i]
                if (!writingGroupUsers) break
                else if (writingGroupUsers.length < 2) {
                    // if (writingGroupUsers.length === 1) setWritingUser(writingGroupUsers[0])
                    if (writingGroupUsers.length === 1) writingUser = writingGroupUsers[0]

                    // setWritingGroupUsers(writingUsers.find(u => currentChatMessages.slice(-1)[0].to_user_ids.includes(u.id) && u.is_writing))
                    writingGroupUsers = writingUsers.find(u => currentChatMessages.slice(-1)[0].to_user_ids.includes(u.id) && u.is_writing)

                } else {
                    const newWritingGroupUsers = writingGroupUsers.filter(u => u.id !== writingUser.id)
                    const randomIndex = Math.floor(Math.random() * newWritingGroupUsers.length)

                    writingUser = writingGroupUsers[randomIndex]
                    writingGroupUsers = newWritingGroupUsers
                }
            }
            setWritingUserGroups(writingUserGroupsCopy)
            setGroupShowedWritingUsers(groupShowedWritingUsersCopy)
        }, 2000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    useEffect(() => {
        if (groupShowedWritingUsers.length === 0 || writingUserGroups.length === 0) {
            setGroupShowedWritingUsers(chats.map(c => null))
            setWritingUserGroups(chats.map(c => []))
        }
    }, [])

    useEffect(() => {
        setCurrentCompanionId(Number(get('user-id') ?? get('group-id')))
    }, [get('user-id'), get('group-id')])

    const onNewGroupCreatingInputChange = (v) => {
        setNewGroupCreationInputValue(v)
        onSearchInputChange(v)
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

        setMessagesFromSearch(foundMessages)

        if (leftNavState === 'searchInputIsFocused' && v.length > 0) setLeftNavState('search')
        else if (v.length === 0) setLeftNavState('searchInputIsFocused')


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
        setCompanionData(u)
        setHasRefInitialized(false)
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
        setCompanionData(u)
        push('/messenger?user-id=' + u.id)
    }

    const onCheckboxChange = (c, u) => {
        setNewGroupCreationInputValue('')
        setSelectedUsersForNewGroup(s => c ? [...s, u] : s.filter(mu => mu.id !== u.id))
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
                setCompanionData(newGroup)
                setLeftSideBarState('users')
                push('/messenger?group-id=' + newGroup.id)
            })
    }

    let timer = null
    
    const onEnterMessageChange = v => {
        inst.post('/users/' + userId + '/update-writing-status', { isWriting: true})
        clearInterval(timer)

       timer = setTimeout(() => {
           inst.post('/users/' + userId + '/update-writing-status', { isWriting: false})
        }, 2000)
        setText(v)
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

    const onDeleteMember = (m) => {
      inst.put('/groups/delete-member/', {userId: m.id, groupId: companionData.id})
          .then(() => {
              const updatedGroups = groups.map(g => g.id === companionData.id ? {...g, user_ids: g.user_ids.filter(id => id !== m.id)} : g)

              dispatch(setGroups(updatedGroups))
          })
    }

    const avatar = companionData?.avatar_photo_urls?.slice(-1)[0] ?? companionData?.avatar_urls?.slice(-1)[0]

    let lastOnlineDateObj
    let lastSeenCompanionTime
    let lastOnlineDateDay
    let lastOnlineDateMonth
    let lastOnlineDateFormatted
    let isLastSeenDateOfCurrDay

    if (companionData && companionData.last_online_date) {
        lastOnlineDateObj = new Date(companionData.last_online_date)

        lastSeenCompanionTime = getTimeFromDate(lastOnlineDateObj)

        lastOnlineDateDay = lastOnlineDateObj.getDate()

        lastOnlineDateMonth = lastOnlineDateObj.toLocaleString('default', { month: 'long' })

        lastOnlineDateFormatted = `${lastOnlineDateDay} ${lastOnlineDateMonth}`

        isLastSeenDateOfCurrDay = new Date().toISOString().split('T')[0] === lastOnlineDateObj.toISOString().split('T')[0]
    }

    // console.log(messages.filter(m => m.id === 79).length, chats[0]?.length)
    console.log(users, groups, messages)
    if (isMessageLoading || typeof companionData?.id === 'undefined' || !refs) return <div><div>Loading...</div><div>{isMessageLoading && 'first'} {!companionData?.id && 'second'}</div></div>

    return <div style={{display: "flex"}}>
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
                                onClick={() => onFoundUserClickHandler(u)}
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
                            {/*{*/}
                            {/*    usersFromUserMessenger.map(u => u.username ?*/}
                            {/*        <div onClick={() => onFoundUserClickHandler(u)}>*/}
                            {/*            <img className={'avatar'}*/}
                            {/*                 src={*/}
                            {/*                     u.avatar_photo_urls?.slice(-1)[0]*/}
                            {/*                         ?*/}
                            {/*                         `${baseURL}${u.avatar_photo_urls?.slice(-1)[0]}`*/}
                            {/*                         :*/}
                            {/*                         AVATAR*/}
                            {/*                 }*/}
                            {/*            />*/}
                            {/*            <div>{u.first_name}</div>*/}
                            {/*        </div>*/}
                            {/*        :*/}
                            {/*        <div onClick={}>*/}
                            {/*            <img className={'avatar'}*/}
                            {/*                 src={*/}
                            {/*                     u.avatar_urls?.slice(-1)[0]*/}
                            {/*                         ?*/}
                            {/*                         `${baseURL}${u.avatar_urls?.slice(-1)[0]}`*/}
                            {/*                         :*/}
                            {/*                         AVATAR*/}
                            {/*                 }*/}
                            {/*            />*/}
                            {/*            <div>{u.name}</div>*/}
                            {/*        </div>*/}
                            {/*    )*/}
                            {/*}*/}
                            {
                                //////////




                                    chats.map(([ m ], i) => {
                                        let u

                                        if (m.group_id) {
                                            u = groups.find(g => g.id === m.group_id)
                                        } else {
                                            const uId = m.from_user_id === Number(userId) ? m.to_user_id : m.from_user_id

                                            u = users.find(u => u.id == uId)
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






                                ////////////////////
                            }

                        </div>
                        <div>
                            <div>Recent</div>
                            {
                                user.found_chat_from_search_ids?.map(({id}) => {
                                    // const u = users.find(u => u.id === id)
                                    const u = !!get('user-id') ? users.find(u => u.id === id) : groups.find(u => u.id === id)
                                    const isUser = !!u.username
                                    const avatar_urls = isUser ? u.avatar_photo_urls : u.avatar_urls
                                    const name = isUser ? `${u.first_name} ${u.second_name}` : u.name
                                    return <div onClick={() => onRecentSearchUserClickHandler(u)}>
                                        <img className={'avatar'}
                                             src={avatar_urls?.slice(-1)[0] ? baseURL + avatar_urls.slice(-1)[0] : AVATAR}/>

                                        <span>{name}</span>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    }
                    {leftNavState === 'noSearch' && <div>
                        {
                            // usersFromUserMessenger.map(u => {
                            //     const userMessages = messages.filter(m => m.from_user_id === u.id || m.to_user_id === u.id)
                            //
                            //     const latestUserMessage = userMessages.reduce((latest, current) => {
                            //         if (new Date(current.time) > new Date(latest.time)) {
                            //             return current;
                            //         } else {
                            //             return latest;
                            //         }
                            //     });
                            //
                            //     const currentDate = new Date(latestUserMessage.time)
                            //
                            //     const hours = String(currentDate.getHours()).padStart(2, '0')
                            //     const minutes = String(currentDate.getMinutes()).padStart(2, '0')
                            //
                            //     const formattedTimeOfLatestUserMessage = `${hours}:${minutes}`
                            //
                            //     const unreadMessagesCount = userMessages.filter(m => !m.read && m.from_user_id !== Number(userId)).length
                            //
                            //     return <div style={{background: "wheat"}}
                            //                 onClick={() => onFoundUserClickHandler(u)}
                            //     >
                            //         <img className={'avatar'}
                            //              src={baseURL + !!u && !!u.avatar_photo_urls ? u?.avatar_photo_urls[0] : AVATAR}/>
                            //         <div>
                            //             <span>{u.username}</span>
                            //             <span>{latestUserMessage.text}</span>
                            //             {unreadMessagesCount > 0 && <span>{unreadMessagesCount}</span>}
                            //         </div>
                            //         <div>{formattedTimeOfLatestUserMessage}</div>
                            //     </div>
                            // })

                            chats.map(([ m ], i) => <Chat
                                i={i}
                                m={m}
                                groups={groups}
                                users={users}
                                user={user}
                                chats={chats}
                                onFoundUserClickHandler={onFoundUserClickHandler}
                                writingUser={groupShowedWritingUsers[i]}
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
                !isUserCurrentChat && <span>
                {groupShowedWritingUsers.length > 0 && groupShowedWritingUsers[currentChatIndex] && `${groupShowedWritingUsers[currentChatIndex].username} is writing...`}
                </span>
            }
        </div>
        <div ref={messageListRef} style={{background: 'green', width: '620px', overflow: "scroll", height: '650px'}}>
        {
            currentChatMessagesState?.map((m, i) => <Message
                currentChatMessages={currentChatMessages}
                i={i}
                m={m}
                companionData={companionData}
                user={user}
                firstUnreadMessageId={firstUnreadMessageId}
                refs={refs}
                usernameOrGroupName={usernameOrGroupName}
            />)
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
}



function compareMessagesByDate(m1, m2) {
    return compareDates(m1.time, m2.time)
}

function compareDates(dateStr1, dateStr2) {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);

    // Сравниваем даты
    if (date1 > date2) {
        return 1;
    } else if (date1 < date2) {
        return -1;
    } else {
        return 0;
    }
}