'use client'

import {useEffect, useRef, useState} from "react";
import axios from "axios";
import cookie from "js-cookie";
import {CreatePostBlock} from "@/components/createPostBlock/CreatePostBlock";
import {useRouter, useSearchParams} from "next/navigation";
import {Post} from "@/components/post/Post";
import {AVATAR, baseURL, inst, userId} from "@/const/const";



export default function Index() {
    const { push } = useRouter()

    if (!userId) push('/login')

    const [posts, setPosts] = useState([])

    const [user, setUser] = useState({})


    const [uploadedPhoto, setUploadedPhoto] = useState('')

    const [comment, setComment] = useState('')

    const [isContactListShowed, setIsContactListShowed] = useState(false)

    const [isRequestListShowed, setIsRequestListShowed] = useState(false)

    const ref = useRef(null)

    const { get } = useSearchParams()

    const getData = async () => {
        const { data: { user } } = await inst.get('/users/me')

        const params = { pageSize: 1, pageCount: 1, pointer: 1 }
        const {data: { posts } } = await inst.get('/posts', { params })

        setUser(user)

        setPosts(posts)
    }

    const hnd = f => {
        setUploadedPhoto(f);

        const r = new FileReader();

        r.onload = () => ref.current.src = r.result;

        r.readAsDataURL(f);
    }

    const likePostHnd = id => { inst.post('/users/post/' + id + '/like') }

    const dislikePostHnd = id => { inst.post('/users/post/' + id + '/dislike') }

    const commentPostHnd = id => { inst.post('/users/post/' + id + '/comment', { comment }) }

    const onShowContactsHnd = async () => {
        //const body = { userIds: user.contacts }

        //const { data: {u}} = await inst.post('/users/get', body)

        setIsContactListShowed(s => !s)
    }

    useEffect(() => { getData() }, [])

    const { id, avatar_photo_ids, second_name, first_name, city, country, description, is_online, contacts, request_user_ids, username, avatar_urls } = user ?? {}

    if (!username) return <div>Loading...</div>

    return (
        <div>
            <div className={'photo_uploader_container'}>
                <img className={'img'} src={!!avatar_photo_ids && !!avatar_photo_ids[1] ? baseURL + 'photos/' + avatar_photo_ids[0] : AVATAR}/>
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
                <div onClick={() => setIsContactListShowed(s => !s)}>{contacts.length} contacts</div>
                    {
                        isContactListShowed && <div>
                            {
                                contacts.map((c, i) => (
                        <div key={i} className={'aligned_row'}>
                            <img
                                className={'avatar'}
                                src={c.user_avatar_url ? baseURL + c.user_avatar_url : AVATAR}
                            />
                            <span>{c.username}</span>
                        </div>
                        )
                    )}</div>}
                </div>
                {userId === id && <div>
                    <div onClick={() => setIsRequestListShowed(s => !s)}>{request_user_ids.length} requests</div>
                    {isRequestListShowed && <div>{request_user_ids.map(id => <div>
                        <span>User</span>
                        <span>Accept</span>
                        <span>Decline</span>
                    </div>)}</div>}
                </div>}
                {/*<button onClick={}>Add to friends</button>*/}
                <button onClick={() => push(`/messenger?first-user-id=${userId}&second-user-id=${get('user-id')}`)}>Write a message</button>
                <div>
                    <CreatePostBlock />
                    {
                        posts.map((p, i) => <Post
                            key={i}
                            commentPostHnd={commentPostHnd}
                            userId={userId}
                            dislikePostHnd={dislikePostHnd}
                            i={i}
                            likePostHnd={likePostHnd}
                            p={p}
                            setComment={setComment}
                            username={username}
                            avatarUrl={avatar_urls?.slice(-1)[0] ?? ''}
                        />)
                        }
                </div>
        </div>
        </div>
    )
}