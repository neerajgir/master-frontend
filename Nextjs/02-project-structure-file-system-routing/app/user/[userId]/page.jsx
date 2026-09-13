import React from 'react'

const UserIdPage = async ({params}) => {
    const {userId} = await params
  return (
    <div>UserIdPage {userId}</div>
  )
}

export default UserIdPage