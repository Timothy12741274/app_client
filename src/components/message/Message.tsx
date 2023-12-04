import React, {useEffect, useRef, useState} from 'react';
import {baseURL, inst, userId} from "@/const/const";
import {getTimeFromDate} from "@/fn/getTimeFromDate";
import {useSearchParams} from "next/navigation";
import EmojiPicker from "emoji-picker-react";

export const Message = ({m, messageRef, setIsSelectMode, setIsDeleteMode, setSelectedMessage, deleteModalRef, setMessagesCallback, setModalPhotoCallback, username, setIsAnswerModeCallback, setSelectedInfoMessage, messageToAnswer, messageToAnswerFromUsername}) => {

    const [isMoreShowed, setIsMoreShowed] = useState(false)

    const [isReactShowed, setIsReactShowed] = useState(false)

    const reactionBarSelectorRef = useRef(null)

    const date = new Date(m.time)
    const time = getTimeFromDate(date)

    const { get } = useSearchParams()

    const isGroup = !!get('group-id')

    const isSelf = m.from_user_id === Number(userId)

    const x = () => {
        document.removeEventListener("click", x)
        setIsMoreShowed(false)
    }

    const y = (e) => {
        if (reactionBarSelectorRef.current && !reactionBarSelectorRef.current.contains(e.target)) {
            setIsReactShowed(false)
            document.removeEventListener("click", y)
        }
    }


    useEffect(() => {
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

    const onReactionSelect = ({ emoji }) => {
        setIsReactShowed(false)
        inst.put('/messages/react', { messageId: m.id, emoji, addEmoji: true })
    }

    const onReactionClick = (k) => {
        inst.put('/messages/react', { messageId: m.id, emoji: k, addEmoji: k !== m.reacted_user_ids[userId] } )
            .then(({ data: updatedMessage}) => {
                setMessagesCallback(updatedMessage)
            })
    }




    if (!messageRef) messageRef = useRef()
    if (!messageToAnswerFromUsername) messageToAnswerFromUsername = username

    if (m.is_deleted || (m.is_deleted_from_me && m.from_user_id === Number(userId))) return <div
        className={m.from_user_id === Number(userId) ? 'user_message' : 'companion_message'}>
        This message has been deleted
    </div>


    return <div
        ref={messageRef}
        style={{"position": "relative"}}
    >

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
            {isReactShowed &&
                <div ref={reactionBarSelectorRef} style={{"position": "absolute", "right": "-15px", "top": "-55px", "zIndex":"1"}}>
                    <EmojiPicker
                                 onEmojiClick={onReactionSelect}/>}
                </div>
            }
                    { isGroup && <div>{isSelf ? username : "here should be userame of that who writted that message"}</div>}
            {m.message_to_answer_id && <div style={{"padding": "5px", "background": "wheat", "borderRadius": "9px"}}>
                <div>{messageToAnswerFromUsername}</div>
                <div>{messageToAnswer.text}</div>
            </div>}
            {m.photos.length !== 0 && <div>
                {
                    m.photos.map(p => <img onClick={() => setModalPhotoCallback(p)} src={`${baseURL}${p}`}/>)
                }
            </div>}
            <div>{m.text}</div>
            <div>{time}</div>
            <div>{m.read ? 'Read' : 'Unread'}</div>
            <div
                style={{position: "absolute", top: 0, right: 5, fontSize: '12px'}}
                onClick={() => setIsMoreShowed(true)}
                id={'moreButton'}
            >More</div>
            {m.emojis.length > 0 && <div style={{"position": "absolute", "right": "20px", "fontSize": "18px", "display": "flex", zIndex: 2}}>
                {
                    m.emojis.map(e => {
                        return Object.keys(e).map(k => {
                            return <div style={{background: "white", "borderRadius": "16px", padding: '2px 6px'}} onClick={onReactionClick}>{k} {e[k]}</div>
                        })
                    })
                }
            </div>}
        </div>
    </div>
}

