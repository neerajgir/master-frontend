import React from 'react'

const DynamicCommentIdPage = async({params}) => {
    const {userId, postId, commentId} = await params
  return (
    <div>
        <h1>DynamicCommentIdPage </h1>
        userId: {userId} <br />
        postId: {postId}
    </div>
  )
}

export default DynamicCommentIdPage