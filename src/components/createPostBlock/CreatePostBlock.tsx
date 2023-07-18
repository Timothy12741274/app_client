import {createRef, useRef, useState} from "react";
import axios from "axios";
import {inst} from "@/const/const";

type CreatePostBlockPT = {

}

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL

export const CreatePostBlock = ({}: CreatePostBlockPT) => {
    const [photos, setPhotos] = useState([])

    const [text, setText] = useState('')

    const hnd = fl => { setPhotos(s => [...s, fl]); const r = new FileReader(); r.onload = () => ref.current.src = r.result; r.readAsDataURL(f) }

    const formData = new FormData()

    for (let i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i]);
    }
    formData.append('text', text)

    const addPostHnd = () => inst.post(BASE_URL + 'posts/add_post', formData)

    return (
        <div>
            <input onChange={e => setText(e.currentTarget.value)}/>

            <span>
                {
                    Array.from(photos).map((p, i) => {
                    const ref = createRef()
                    const r = new FileReader(); r.onload = () => ref.current.src = r.result; r.readAsDataURL(p)

                    return <img key={i} ref={ref}/>
                })
                }
            </span>

            <input placeholder={'Something new?'} type={'file'} onChange={e => hnd(e.target.files[0])}/>

            <button onClick={addPostHnd}>Add Post</button>
        </div>
    )
}