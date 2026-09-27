import { connectDB } from "@/lib/db.js"; 
import Note from "@/lib/models/note.js"; 

export async function POST(req) {
  try {
    await connectDB(); 

    const { title, content } = await req.json(); 

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required." }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newNote = new Note({ title, content }); 
    await newNote.save(); 

    return new Response(JSON.stringify(newNote), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
