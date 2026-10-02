"use client"
import {useParams} from 'next/navigation'

const ShopSlugPage = () => {
    const param = useParams()
    console.log(param)
  return (
    <div>ShopSlugPage</div>
  ) 
}

export default ShopSlugPage