import React from 'react'

const DynamicUserPage = async({params}) => {
    const {userId} = await params
  return (
    <div>DynamicUserPage {userId}</div>
  )
}

export default DynamicUserPage