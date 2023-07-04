'use client'

import {useEffect, useRef, useState} from "react";
import axios from "axios";
import cookie from "js-cookie";
import {CreatePostBlock} from "@/components/createPostBlock/CreatePostBlock";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL
const AVATAR = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL
const config = { withCredentials: true }

export default function Index() {
    const [user, setUser] = useState({})

    const [posts, setPosts] = useState([])

    const [uploadedPhoto, setUploadedPhoto] = useState('')

    const [comment, setComment] = useState('')

    const [showComments, setShowComments] = useState([])

    const isCommentInputShow

    const ref = useRef(null)

    const getUser = async () => setUser(await axios.get(BASE_URL + 'users/1', config).then(res => res.data))  // users/${cookie.get('userId')

    const getPosts = async () => setPosts(await axios.post(BASE_URL + 'posts', {ids: user.post_ids}, config).then(res => res.data))

    const hnd = f => { setUploadedPhoto(f); const r = new FileReader(); r.onload = () => ref.current.src = r.result; r.readAsDataURL(f) }

    const addAvatarPhotoHnd = () => axios.post(BASE_URL + '/users/avatar', { uploadedPhoto }, config); ref.current.src = ''

    const showCmtHnd = id => { const prev = showComments[id]; setShowComments(s => { s[id] = !s[id]; return s}) }

    const likePostHnd = id => { axios.post(BASE_URL + '/users/post/' + id + '/like')}
    const dislikePostHnd = id => { axios.post(BASE_URL + '/users/post/' + id + '/dislike')}
    const commentPostHnd = id => { axios.post(BASE_URL + '/users/post/' + id + '/comment', { comment })}

    useEffect(() => { getUser() }, [])

    useEffect(() => { getPosts() }, [user])

    useEffect(() => { setShowComments(posts.map(p => false)) }, [posts])

    if (!!user[0]) return <div>loading...</div>

    const { avatar_photo_ids, second_name, first_name, city, country, description, is_online } = user

    return (
        <div>
            <div className={'photo_uploader_container'}>
                <img className={'img'} src={!!avatar_photo_ids[1] ? BASE_URL + 'photos/' + avatar_photo_ids[0] : AVATAR}/>
                <input className={'photo_uploader'} type={'file'} onChange={e => hnd(e.target.files[0])}/>
                {
                    uploadedPhoto && <div>
                    {ref.current.src && <img ref={ref}/>}
                    <button onClick={addAvatarPhotoHnd}>Add</button>
                    </div>
                }
            <div>{first_name} {second_name}</div>
            <div>{city}, {country}</div>
            <div>{description}</div>
            <div>{is_online ? 'Online' : 'Offline'}</div>

                <div>
                    <CreatePostBlock />
                    {
                        posts.map((p, i) => <div>
                            <div>{p.text}</div>
                            {p.photo_urls.map(url => <img src={BASE_URL + url} className={'photo'}/>)}
                            <div>
                                <span>Like</span>
                                <span>Dislike</span>
                                <span onClick={() => set}>Comment</span>
                            </div>
                            <div>
                                <div onClick={() => setShowComments(s => { s[i] = !s[i]; return s})}>Show comments</div>
                                {showComments[i] && <div>}
                            </div>
                        </div>)
                    }
                </div>
        </div>
        </div>
    )
}