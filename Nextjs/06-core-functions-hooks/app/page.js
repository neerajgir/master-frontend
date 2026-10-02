// "use client"
// import { usePathname } from "next/navigation";

// export default function Home() {
//   const pathname = usePathname();
//   return (
//   <h1>Current PathName: {pathname}</h1>
//   );
// }

import { redirect } from "next/navigation";


const Home = () => {
    const isLoggedIn = true
    if(!isLoggedIn){
      redirect("/login")
    }
  return (
    <div>Current Pathname</div>
  ) 
}

export default Home