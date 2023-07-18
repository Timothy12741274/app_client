import {useEffect, useState} from "react";
import {inst, baseURL, AVATAR, userId} from "@/const/const";

type CommentPT = {
    c: any
    key: any
    avatarUrl: string
    username: string
}

export const Comment = ({ c, key, avatarUrl, username }: CommentPT) => {

    const [comments, setComments] = useState([])

    const [text, setText] = useState('')

    const [showComments, setShowComments] = useState(false)

    //const body = { commentId: c.id, postId: p.id, userId }

    const [isShowCommentInput, setIsShowCommentInput] = useState(false)

    const isLiked = c.liked_user_ids.includes(Number(userId))

    const getAndSetComments = async () => {
        const params = { commented_element_id: c.id, commented_element_type: 'comment' }

        const { data: { comments } } = await inst.get('/comments', { params })

        setComments(comments)
    }

    const addCommentHnd = () => {
        const body = { text, commentedElementId: c.id, commentedElementType: 'comment', avatarUrl : avatarUrl ? avatarUrl : 'img.png', username }
        inst.post('/comments', body)

        getAndSetComments()
    }

    const onLikePost = () => {

        inst.post('/comments/add_like', { commented_element_id: c.id, isLiked })
    }

    useEffect(() => {
        getAndSetComments()
    }, [])



    return <div key={key}>
        <div>
            <img className={'avatar'}
                 src={c.user_avatar_url ? baseURL + c.user_avatar_url : AVATAR}
            />

            <span>{c.username}</span>
        </div>

        <div>{c.text}</div>

        <div>
            <span className={isLiked ? 'liked' : ''} onClick={onLikePost}>{c.liked_user_ids?.length ?? ''} like</span>
            <span>{c.disliked_user_ids?.length ?? ''} dislike</span>
            <span onClick={() => setIsShowCommentInput(s => !s)}>{c.comment_ids ? `${c.comment_ids.length} comments` : 'Comment'}</span>
        </div>

                <div>
                    {
                        comments && <button onClick={() => setShowComments(s => !s)}>
                            {comments.length} comments
                        </button>
                    }
                    { showComments && <div className={'comment_comments'}>{ comments.map((c, i) => <Comment c={c} key={i} avatarUrl={avatarUrl} username={username} />) }</div> }
                </div>

        {isShowCommentInput && <div>
            <input onChange={e => setText(e.currentTarget.value)}/>

            <button onClick={addCommentHnd}>Add comment</button>
        </div>}
    </div>
}

