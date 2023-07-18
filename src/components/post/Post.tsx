import {useEffect, useState} from "react";
import {Simulate} from "react-dom/test-utils";
import {Comment} from "@/components/post/comment/Comment";
import {inst, baseURL} from "@/const/const";

type PostPT = {
    p: any
    likePostHnd: any
    dislikePostHnd: any
    setComment: any
    commentPostHnd: any
    userId: any
    i: any
    key: number
    avatarUrl: string
    username: string
}

export const Post = (
    { commentPostHnd, dislikePostHnd, setComment, likePostHnd, userId, p, i, key, username, avatarUrl }: PostPT
) => {

    const [comments, setComments] = useState([])

    const [isCommentInputShowed, setIsCommentInputShowed] = useState(false)

    const [showComments, setShowComments] = useState(false)

    const [isLoading, setIsLoading] = useState(true)

    const getAndSetComments = async () => {
        try {
            const params = {commented_element_id: p.id, commented_element_type: 'post'}

            const { data: { comments } } = await inst.get('/comments', {params})

            setComments(comments)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getAndSetComments()
    }, [])

    if (isLoading) return <div>Loading...</div>

    return <div key={key}>
        <div>{p.text}</div>

        {p.photo_urls.map((url, i) => <img key={i} src={baseURL + url} className={'photo'}/>)}

        <div>
            <span onClick={() => likePostHnd(i)}>Like</span>
            <span onClick={() => dislikePostHnd(i)}>Dislike</span>
            <span onClick={() => setIsCommentInputShowed(s => !s)}>Comment</span>
            {isCommentInputShowed && <div>
                <input onChange={e => setComment(e.currentTarget.value)}/>
                <button onClick={() => commentPostHnd(i)}>Add comment</button>
            </div>}
        </div>

        <div>
            <button onClick={() => setShowComments(s => !s)}>
                {comments.length !== 0 ? `${comments.length} comments` : 'Comment'}
            </button>

            {
                showComments && <div>
                {comments?.map((c, i) => {
                    return <Comment p={p} c={c} userId={userId} key={i} username={username} avatarUrl={avatarUrl}/>
                })
                }
            </div>
            }
        </div>
    </div>
}

