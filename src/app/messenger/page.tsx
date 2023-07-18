import {baseURL, inst} from "@/app/profile/page";
import {useSearchParams} from "next/navigation";
import cookie from "js-cookie";
import {useEffect, useState} from "react";
import {getDataString} from "@/fn/getDataString";

export default function Index() {
    const { get } = useSearchParams()
    const [messages, setMessages] = useState([])

    const [text, setText] = useState('')

    const [companionData, setCompanionData] = useState({})

    const [isLoading, setIsLoading] = useState(true)

    const getMessages = async () => {
        const params = {firstUserId: cookie.get('userId'), secondUserId: get('user-id')}
        const { messages, companionData } = await inst.get('/messages', { params })

        setMessages(messages)
        setCompanionData(companionData)
    }

    const sendMessageHnd = () => {
        const time = getDataString()
        inst.post('/messages', {time, text, fromUserId: get('userId'), toUserId: companionData.id})
        setText('')
    }

    useEffect(() => { getMessages() }, [])

    useEffect(() => { setIsLoading(false)}, [messages])

    if (isLoading) return <div>Loading...</div>

    return <div>
        <div onClick={`/profile?user-id=${companionData.id}`}>
            <img src={baseURL + companionData.avatar_photo_urls.slice(-1)[0]}/>
            <span>{companionData.username}</span>
        </div>
        {
            messages.map(m => <div className={m.from_user_id === get('userId') ? 'user_message' : 'companion_message'}>
            <div>{companionData.username}</div>
            <div>{m.text}</div>
            <div>{m.time}</div>
        </div>)
        }

        <div>
            <input value={text} onChange={e => setText(e.currentTarget.value)}/>
            <button onClick={sendMessageHnd}>Send</button>
        </div>
    </div>
}