"use client"
import { useRouter } from 'next/navigation'

const Orders = () => {
  const router = useRouter()
  return (
    <>
     {/* <div className="hover:cursor-pointer"onClick={()=>router.push("/shop/products")}>Go To Products</div> */}
     {/* <div className="hover:cursor-pointer"onClick={()=>router.replace("/shop/products")}>Go To Products</div> */}
    <button onClick={()=>router.refresh()}>Refresh</button>
    //router.back
    //router.forward
    </>
  )
}

export default Orders