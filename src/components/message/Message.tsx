import React, {useEffect, useRef, useState} from 'react';
import {userId} from "@/const/const";
import {getTimeFromDate} from "@/fn/getTimeFromDate";
import {Picker} from "@/components/picker/Picker";
import {ReactionBarSelector} from "@charkour/react-reactions";
import {useSearchParams} from "next/navigation";
// import 'emoji-mart/css/emoji-mart.css';

export const Message = ({m, /*i,*/ messageRef, setIsSelectMode, setIsDeleteMode, setSelectedMessage, deleteModalRef, /*firstUnreadMessageId, currentChatMessages,*/ /*companionData,*/ /*time,*/ /*user,*/ username, /*usernameOrGroupName,*/ setIsAnswerModeCallback, /*users,*/ setSelectedInfoMessage, messageToAnswer, messageToAnswerFromUsername /*messageToAnswer, messageToAnswerFromUsername*/}) => {

    const [isMoreShowed, setIsMoreShowed] = useState(false)

    const [isReactShowed, setIsReactShowed] = useState(false)

    const ref = useRef()

    const reactionBarSelectorRef = useRef(null)

    // const date = new Date(m.time)
    //
    // const day = date.getDate()
    //
    // const month = date.toLocaleString('default', { month: 'long' })

    // const time = getTimeFromDate(date)
    const date = new Date(m.time)
    const time = getTimeFromDate(date)

    const { get } = useSearchParams()

    const isGroup = !!get('group-id')

    // const dataForUser = `${day} ${month}`

    const isSelf = m.from_user_id === Number(userId)

    // const messageToAnswer = m.message_to_answer_id ? currentChatMessages.find(mm => mm.id === m.message_to_answer_id) : null
    // const messageToAnswerFromUsername = m.message_to_answer_id ? users.find(u => u.id === messageToAnswer.from_user_id).username : null
    
    const x = () => {
        console.log('WWW2')
        document.removeEventListener("click", x)
        setIsMoreShowed(false)
    }

    const y = (e) => {
        console.log('in', reactionBarSelectorRef.current, 'contains', e.target)
        if (reactionBarSelectorRef.current && !reactionBarSelectorRef.current.contains(e.target)) {
            setIsReactShowed(false)
            document.removeEventListener("click", y)
        }
    }

    console.log('not in', reactionBarSelectorRef.current)

    useEffect(() => {
        console.log('WWW', isMoreShowed)
        if (isMoreShowed) {
            document.addEventListener("click", x)
        }
    }, [isMoreShowed])

    const onReactBtnPress = () => {
        setIsReactShowed(true)
      document.addEventListener("click", y)
    }

    const x1 = (e) => {
      if (deleteModalRef.current.contains(e.target)) {
          setIsDeleteMode(false)
          document.removeEventListener("click", x1)
      }
    }

    const onDeleteBtnClick = () => {
        setSelectedMessage(m)
        setIsDeleteMode(true)
        document.addEventListener("click", x1)
    }

    const onReactionSelect = (e) => {

    }

    if (!messageRef) messageRef = useRef()
    if (!messageToAnswerFromUsername) messageToAnswerFromUsername = username

    if (m.is_deleted || (m.is_deleted_from_me && m.from_user_id === Number(userId))) return <div
        className={m.from_user_id === Number(userId) ? 'user_message' : 'companion_message'}>
        This message has been deleted
    </div>


    return <div
        // key={i}
        /*ref={(el) => (divRefs.current[i] = el)}*/
        ref={messageRef}
    >
        {/*{firstUnreadMessageId === i && <div>Unread messages</div>}*/}
        {/*{*/}
        {/*    (*/}
        {/*        (currentChatMessages && !currentChatMessages[i - 1])*/}
        {/*        ||*/}
        {/*        (currentChatMessages && currentChatMessages[i - 1] && m.time.split('T')[0] !== currentChatMessages[i - 1].time.split('T')[0])*/}
        {/*    ) && <div className={'message_data_label'}>{dataForUser}</div>*/}
        {/*}*/}


        <div className={m.from_user_id === Number(userId) ? 'user_message' : 'companion_message'}>
            {isMoreShowed && <div style={{position: "absolute", "background": "white"}}>
                <div onClick={() => setSelectedInfoMessage(m)}>Data about message</div>
                <div onClick={() => setIsAnswerModeCallback(m)}>Answer</div>
                <div onClick={onReactBtnPress}>React</div>
                <div onClick={() => setIsSelectMode(true)}>Resend</div>
                <div onClick={() => setIsDeleteMode(true)}>Select</div>
                {/*<div>In favorites</div>*/}
                <div onClick={onDeleteBtnClick}>Delete</div>
            </div>}
            {isReactShowed && <ReactionBarSelector ref={reactionBarSelectorRef} style={{"position": "absolute", "right": "-15px", "top": "-55px"}} onSelect={onReactionSelect}/>}
            {/*Array.isArray(companionData)*/ isGroup && <div>{isSelf ? username : "here should be userame of that who writted that message"}{/*usernameOrGroupName*/}</div>}
            {m.message_to_answer_id && <div style={{"padding": "5px", "background": "wheat", "borderRadius": "9px"}}>
                <div>{messageToAnswerFromUsername}</div>
                <div>{messageToAnswer.text}</div>
            </div>}
            <div>{m.text}</div>
            {/*<div>{m.time.substring(11, 16)}</div>*/}
            <div>{time}</div>
            <div>{m.read ? 'Read' : 'Unread'}</div>
            <div
                style={{position: "absolute", top: 0, right: 5, fontSize: '12px'}}
                onClick={() => setIsMoreShowed(true)}
                id={'moreButton'}
            >More</div>
        </div>
    </div>
}

