export async function PUT(request,{params}){
    const data = await request.json()
    const updatedTodo = {id:params.id,...data}
    return Response.json({success:true,updatedTodo})
}

export async function PATCH(request,{params}){
    const data = await request.json()
    const updatedTodo = {id:params.id,...data}
    return Response.json({success:true,updatedTodo})
}   

export async function DELETE(request,{params}){
    return Response.json({success:true,message:`Todo with id ${params.id} deleted`})
}