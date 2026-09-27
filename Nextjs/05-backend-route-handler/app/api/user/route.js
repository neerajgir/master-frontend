import {headers} from "next/headers"

//headers
export async function GET(request){
    const headersList =  await headers()
    // const headers = new Headers(request.headers)
    console.log(headersList.get("Authorization"))
    console.log(headersList.get("user-agent"))
    return new Response("<h1>Hello World</h1>",{
        headers:{
            "Content-Type":"text/html",
            "Set-Cookie":"theme=dark"
        }
    })
    // return Response.json({message:"Hello World")
}

