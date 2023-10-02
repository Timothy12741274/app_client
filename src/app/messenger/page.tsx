'use client'

import {useRouter, useSearchParams} from "next/navigation";
import cookie from "js-cookie";
import {createRef, useEffect, useMemo, useRef, useState} from "react";
import {getDataString} from "@/fn/getDataString";
import {inst, baseURL, AVATAR, userId} from "@/const/const";
import {useDispatch, useSelector} from "react-redux";
import {addMessage, addMessages, setIsMessageLoading, setMessages, setReadMessage} from "@/store/slices/messageSlice";
import {addUsers, setUsers} from "@/store/slices/userSlice";

export default function Index() {
    const dispatch = useDispatch()
    const { get } = useSearchParams()

    const users = useSelector(state => state.userData.users)

    const user = users.find(u => u.id === Number(userId))

    const { messages, isMessageLoading } = useSelector(state => state.messageData)

    const { push } = useRouter()

    const [text, setText] = useState('')

    const [hasRefInitialized, setHasRefInitialized] = useState(false)

    const [leftNavState, setLeftNavState] = useState('noSearch')

    const [usersFromSearch, setUsersFromSearch] = useState([])
    const [messagesFromSearch, setMessagesFromSearch] = useState([])

    const [allUsers, setAllUsers] = useState()

    const [isMenuShowed, setIsMenuShowed] = useState(false)

    const [leftSideBarState, setLeftSideBarState] = useState('users')

    const [isMoreInSettingsShowed, setIsMoreInSettingsShowed] = useState(false)

    const [companionData, setCompanionData] = useState({})

    const [currentChatMessagesState, setCurrentChatMessagesState] = useState([])

    const currentChatMessages = useMemo(() => {
        const filteredAndSortedMessages = messages
            .filter(m =>
                (m.from_user_id === companionData.id || m.to_user_id === companionData.id) &&
                (m.from_user_id === Number(userId) || m.to_user_id === Number(userId))
            )
            .sort(compareMessagesByDate)
        // debugger
        return filteredAndSortedMessages

    }, [messages, companionData])


    const ref = useRef(null)

    const logOutBtnRef = useRef(null)

    useEffect(() => {
        setCurrentChatMessagesState(currentChatMessages)
    }, [currentChatMessages])

    useEffect(() => {
        if (!companionData.id && !users.find(u => u.id === Number(get('user-id')))) {
            inst.get('/users/get-user/' + get('user-id')).then(( res  => {
                setCompanionData(res.data.user)
                dispatch(addUsers(res.data.user))
            }))
        }
    }, [users])

    useEffect(() => {
        getAndSetAllUsers()
    }, [])

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
        let newMessage = { time, text, from_user_id: user.id, to_user_id: companionData.id, isRead: companionData.is_online }

        inst.post('/messages', newMessage)
            .then(res => dispatch(addMessage(res.data)))

        setText('')
    }

    useEffect(() => { getMessages() }, [])

    useEffect(() => {
         if (users.length === 0 || messages.length === 0) {
            inst.get('/users/get-users/' + userId)
                .then(({data}) => {
                    setIsUsersLoading(false)
                    dispatch(setUsers(data))
                })

            inst.get('/messages/get-user-messages/' + userId)
                .then(({data}) => {
                    setIsMessagesLoading(false)
                    dispatch(addMessages(data))
                })
        }
    }, [])

    const userIdsFromUserMessenger = messages.map(u => u.from_user_id === userId ? u.to_user_id : u.from_user_id)
    const usersFromUserMessenger = users.filter(u => userIdsFromUserMessenger.includes(u.id))

    const onKeyDownHnd = (e) => {
      if (e.key === 'Enter') {
          sendMessageHnd()
      }
    }

    const refs = currentChatMessages.map(() => createRef())

    const messageListRef = useRef(null)

    let firstUnreadMessageId = -1

    currentChatMessages.map((m, i) => {
        if (!m.read && m.from_user_id !== Number(userId) && firstUnreadMessageId === -1) firstUnreadMessageId = i
    })

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
        if (!hasRefInitialized && messageListRef.current && refs[0] && refs[0].current) scrollToUnread()
    }, [messageListRef.current, refs])

    useEffect(() => {
        if (messageListRef.current) {
            setTimeout(() => {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }, 0);
        }
    }, [messageListRef.current && messageListRef.current.scrollHeight, messages])

    useEffect(() => {
        refs.map((elementRef, i) => {
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
                if (!currentChatMessages[i].read && currentChatMessages[i].from_user_id !== user.id) {
                    inst.put('/messages/' + i).then(() => dispatch(setReadMessage(i)))
                }
            }
        });
    };





    /////////////

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
    
    const onSearchInputFocus = (v) => {
      if (leftNavState === 'noSearch') setLeftNavState('searchInputIsFocused')
    }

    const onFoundUserClickHandler = (u) => {
        if (user.found_user_from_search_ids[0] !== u.id) {
            let newUsers = [...users]

            if (user.found_user_from_search_ids.includes(u.id)) {
                newUsers = users.map(mu =>
                    mu.id === user.id ?
                        {...user, found_user_from_search_ids: user.found_user_from_search_ids.filter(id => id !== u.id)}
                        :
                        mu
                )
            }
            const    ids = [...newUsers.find(u => u.id === user.id).found_user_from_search_ids]
            ids.unshift(u.id)

            inst.put('/users/update-recent', { ids })
                .then(() => dispatch(setUsers(newUsers)))

        }
        setCompanionData(u)
        setHasRefInitialized(false)
        push('/messenger?user-id=' + u.id)
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


    if (isMessageLoading || typeof companionData?.id === 'undefined') return <div><div>Loading...</div><div>{isMessageLoading && 'first'} {!companionData?.id && 'second'}</div></div>

    return <div style={{display: "flex"}}>
        <div>
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
                                usersFromUserMessenger.map(u => <div onClick={() => onFoundUserClickHandler(u)}>
                                    <img className={'avatar'}
                                         src={u.avatar_photo_urls?.slice(-1)[0] ? `${baseURL}${u.avatar_photo_urls?.slice(-1)[0]}` : AVATAR}/>
                                    <div>{u.first_name}</div>
                                </div>)
                            }
                        </div>
                        <div>
                            <div>Recent</div>
                            {
                                user.found_user_from_search_ids?.map(id => {
                                    const u = users.find(u => u.id === id)

                                    return <div onClick={() => onRecentSearchUserClickHandler(u)}>
                                        <img className={'avatar'}
                                             src={u.avatar_photo_urls?.slice(-1)[0] ? baseURL + u.avatar_photo_urls.slice(-1)[0] : AVATAR}/>

                                        <span>{u.first_name} {u.second_name}</span>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    }
                    {leftNavState === 'noSearch' && <div>
                        {
                            usersFromUserMessenger.map(u => {
                                const userMessages = messages.filter(m => m.from_user_id === u.id || m.to_user_id === u.id)

                                const latestUserMessage = userMessages.reduce((latest, current) => {
                                    if (new Date(current.time) > new Date(latest.time)) {
                                        return current;
                                    } else {
                                        return latest;
                                    }
                                });

                                const currentDate = new Date(latestUserMessage.time)

                                const hours = String(currentDate.getHours()).padStart(2, '0')
                                const minutes = String(currentDate.getMinutes()).padStart(2, '0')

                                const formattedTimeOfLatestUserMessage = `${hours}:${minutes}`

                                const unreadMessagesCount = userMessages.filter(m => !m.read).length

                                return <div style={{background: "wheat"}}
                                            onClick={() => onFoundUserClickHandler(u)}>
                                    <img className={'avatar'}
                                         src={baseURL + !!u && !!u.avatar_photo_urls ? u?.avatar_photo_urls[0] : AVATAR}/>
                                    <div>
                                        <span>{u.username}</span>
                                        <span>{latestUserMessage.text}</span>
                                        <span>{unreadMessagesCount}</span>
                                    </div>
                                    <div>{formattedTimeOfLatestUserMessage}</div>
                                </div>
                            })
                        }
                    </div>
                    }
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
        <div className={'chat_panel'} onClick={() => push(`/profile?user-id=${companionData.id}`)} style={{display: "flex", alignItems: "center"}}>
            <img
                src={
                    companionData.avatar_photo_urls?.slice(-1)[0] ?
                        baseURL + companionData.avatar_photo_urls?.slice(-1)[0]
                        :
                        AVATAR
                }
                className={'avatar'}
            />
            <span>{companionData.username}</span>
            <span>{companionData.is_online ? 'online' : 'offline'}</span>
        </div>
        <div ref={messageListRef} style={{background: 'green', width: '620px', overflow: "scroll", height: '650px'}}>
        {
            currentChatMessagesState?.map((m, i) => {
                const date = new Date(m.time)

                const day = date.getDate()

                const month = date.toLocaleString('default', { month: 'long' })

                const time = getTimeFromDate(date)

                const dataForUser = `${day} ${month}`

                const isSelf = m.from_user_id === Number(userId)

                return <div
                    key={i}
                    /*ref={(el) => (divRefs.current[i] = el)}*/
                    ref={refs[i]}
                    >
                    {firstUnreadMessageId === i && <div>Unread messages</div>}
                    {
                        (
                            (!currentChatMessages[i - 1])
                            ||
                            (currentChatMessages[i - 1] && m.time.split('T')[0] !== currentChatMessages[i - 1].time.split('T')[0])
                        ) && <div className={'message_data_label'}>{dataForUser}</div>
                    }

                    <div className={m.from_user_id === Number(userId) ? 'user_message' : 'companion_message'}>
                        {Array.isArray(companionData) && <div>{isSelf ? user.username : companionData.username}</div>}
                    <div>{m.text}</div>
                    {/*<div>{m.time.substring(11, 16)}</div>*/}
                        <div>{time}</div>
                        <div>{m.read ? 'Read' : 'Unread'}</div>
                    </div>
                </div>
            })
        }
        </div>

        <div className={'chat_panel'}>
            <input value={text} onChange={e => setText(e.currentTarget.value)} onKeyDown={onKeyDownHnd}/>
            <button onClick={sendMessageHnd}>Send</button>
        </div>
    </div>
    </div>
}

function getTimeFromDate(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Форматирование часов и минут в двузначный вид с ведущими нулями
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    return `${formattedHours}:${formattedMinutes}`;
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