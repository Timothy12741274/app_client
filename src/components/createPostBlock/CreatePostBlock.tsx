import {useRef, useState} from "react";
import axios from "axios";

type CreatePostBlockPT = {

}

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL

export const CreatePostBlock = ({}: CreatePostBlockPT) => {
    const [photos, setPhotos] = useState([])

    const [text, setText] = useState('')

    const hnd = fs => { setPhotos(fs); const r = new FileReader(); r.onload = () => ref.current.src = r.result; r.readAsDataURL(f) }

    const addPostHnd = () => axios.post(BASE_URL + '/users/post/', {text, photos})

    return (
        <div>
            <input onChange={e => setText(e.currentTarget.value)}/>

            <div>
                {photos.map(p => {
                    const ref = useRef()
                    const r = new FileReader(); r.onload = () => ref.current.src = r.result; r.readAsDataURL(p)

                    return <img ref={ref}/>
                })}
            </div>

            <input type={'file'} onChange={e => hnd(e.target.files)}/>
            <button onClick={addPostHnd}></button>
        </div>
    )
}