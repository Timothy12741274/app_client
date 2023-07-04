import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";

export default function Index() {

    const { push } = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onRegisterHandler = () => {
      axios.post('http://localhost:5000/auth/register', {email, password}, {withCredentials: true})
          .then(() => push('/login'))
    }
    return (
        <div>
            <input value={email} onChange={e => setEmail(e.currentTarget.value)}/>
            <input value={password} onChange={e => setPassword(e.currentTarget.value)}/>
            <button onClick={onRegisterHandler}>Register</button>
        </div>
    )
}