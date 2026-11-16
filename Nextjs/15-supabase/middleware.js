import { NextResponse } from "next/server";
import { createClient } from "./lib/supabase/server";



export async function middleware(request) {
    const response = NextResponse.next({
        request:{
            headers:request.headers
        }
    })
    const supabase = createClient();
    (await supabase).auth.getUser();
    return response;
}

export const config = {
    matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};