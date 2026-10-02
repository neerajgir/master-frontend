"use client"
import {useParams, usePathname} from 'next/navigation'

const ShopTagItem = () => {
    const param = useParams()
    const pathname = usePathname()
    console.log(param)
  return (
    <div>ShopTagItem: {pathname}</div>
  ) 
}

export default ShopTagItem