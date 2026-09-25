export async function POST(request){
    const body = await request.json()
    const {title, completed} = body


    return Response.json({
        success: true,
        message: "Todo created successfully",
        todo: {
            title,
            completed
        }
    })
}