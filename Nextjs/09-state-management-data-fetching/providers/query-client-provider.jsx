"use client";
import {useState} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


function QueryClientProviderClient({children}) {
    const [queryClient] = useState(()=>new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default QueryClientProviderClient;
