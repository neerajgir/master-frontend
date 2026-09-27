import {headers, cookies} from "next/headers"

//headers - cookie
export async function GET(request){
    const headersList =  await headers()
    // const username = request.cookies.get("username")
    // console.log(username)
    const cookieStore = await cookies()
    cookieStore.set("theme","dark")
    const username = cookieStore.get("theme")
    console.log(username)
    // const headers = new Headers(request.headers)
    console.log(headersList.get("Authorization"))
    console.log(headersList.get("user-agent"))
    return new Response("<h1>Hello World</h1>",{
        headers:{
            "Content-Type":"text/html",
            "set-cookie": "username=neeraj"
        }
    })
    // return Response.json({message:"Hello World")
}

