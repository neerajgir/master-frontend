import { notFound } from 'next/navigation';
import React from 'react'

const DynamicUserPage = async({params}) => {
    const {userId} = await params
    if(userId > 10){
      notFound()
    }
  return (
    <div>DynamicUserPage {userId}</div>
  )
}

export default DynamicUserPage