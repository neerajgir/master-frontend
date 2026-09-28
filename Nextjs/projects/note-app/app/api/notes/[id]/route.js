import { connectDB } from "@/lib/db.js"; 
import Note from "@/lib/models/note.js"; 

export async function DELETE(req, {params}){
    await connectDB();
    const {id} = await params;
    try {
        const note = await Note.findByIdAndDelete(id);
        
        if (!note) {
            return Response.json({ error: "Note not found" }, { status: 404 });
        }
        
        return Response.json({ message: "Note deleted" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Invalid ID format or server error" }, { status: 500 });
    }
}

export async function PUT(req, {params}){
    await connectDB();
    const {id} = await params;
    const {title, content} = await req.json();
    try {
        const note = await Note.findByIdAndUpdate(id, {title, content}, {returnDocument:"after"});
        if (!note) {
            return Response.json({ error: "Note not found" }, { status: 404 });
        }
        return Response.json({ message: "Note updated", note }, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Invalid ID format or server error" }, { status: 500 });
    }
}