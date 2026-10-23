"use client";

import AddPost from "@/components/add-post";
import PostList from "@/components/post-list";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // const {data, error, isLoading} = useQuery({
  //   queryKey: ["user-data"],
  //   queryFn: ()=> fetch('https://api.freeapi.app/api/v1/public/randomusers?page=1&limit=10').then((res)=>res.json())
  // })
  // if(isLoading){
  //   return <div>Loading...</div>
  // }
  // if(error){
  //   return<div>{error}</div>
  // }
  // return (
  //   <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
  //     {JSON.stringify(data, null, 2)}
  //   </div>
  // );
  return(
    <div>
      <h1>Post List</h1>
      <PostList/>
      <AddPost/ >
    </div>
  )
}
