'use client'

import Link from "next/link";
import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import cookie from 'js-cookie'

export default function Index() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { push } = useRouter()

    const onEnterHandler = () => {
      axios.post('http://localhost:5000/auth', {email, password}, {withCredentials: true})
          .then(res => {
              cookie.set('userId', res.data.id, {expires: 1000 * 60 * 60 * 24 * 5})
              push('/')
          })
    }

    return (
        <div>
            <input value={email} onChange={e => setEmail(e.currentTarget.value)}/>
            <input value={password} onChange={e => setPassword(e.currentTarget.value)}/>
            <button onClick={onEnterHandler}>Enter</button>
            <Link href={'/register'}>Register</Link>
        </div>
    )
}