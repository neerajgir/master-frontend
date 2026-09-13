import React from 'react'

const DynamicPostIdPage = async({params}) => {
    const {userId, postId} = await params
  return (
    <div>
        <h1>DynamicPostIdPage </h1>
        userId: {userId} <br />
        postId: {postId}
    </div>
  )
}

export default DynamicPostIdPage