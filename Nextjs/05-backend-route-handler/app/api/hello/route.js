//get endpoint
// export async function GET(request){
//     const url = new URL(request.url)
//     const searchParams = new URLSearchParams(url.searchParams)
//     const name = searchParams.get('name')

//     const res =await fetch('https://jsonplaceholder.typicode.com/todos',{
//         headers:{
//             'Content-Type':'application/json',
//         },
//     })
//     const data = await res.json()
//     return Response.json({data})
// }

//query params
export async function GET(request){
    const url = new URL(request.url)
    const {searchParams} = url;
    const apiUrl = new URL("https://jsonplaceholder.typicode.com/todos")

    searchParams.forEach((value,key)=>{
        apiUrl.searchParams.append(key,value)
    })
    const res =await fetch(apiUrl,{headers:{'Content-Type':'application/json'}})
    const data = await res.json()
    return Response.json({data}) 
}