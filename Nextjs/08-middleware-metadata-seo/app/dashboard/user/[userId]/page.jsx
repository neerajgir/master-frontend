import React from 'react'

export async function generateMetadata({params}) {
    const {userId} = await params;
    return{
        title: `User ${userId}`,
        description: `Profile Page For User ${userId}`
    }
}

const UserIdPage = async({params}) => {
    const {userId} = await params;
  return (
    <div>UserIdPage:{userId}</div>
  )
}

export default UserIdPage