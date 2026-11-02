// import { getUserList, updateList } from "@/actions";
// import Image from "next/image";

// import UserList from "@/components/user-list";
import UserManagement from "@/components/users";
import { Suspense } from "react";

// export const instant = false;

// // Define a type for the MockAPI user structure based on the payload data
// interface User {
//   id: string;
//   name: string;
//   avatar: string;
//   createdAt: string;
// }

// export default async function Home() {
//   const data = await getUserList();
  
//   return (
//     <div className="flex flex-col flex-1 bg-zinc-50 font-sans text-zinc-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen p-8">
//       <h1 className="text-4xl font-bold mb-8">User List</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {data.map((user: User, index: number) => {
//           return (
//             <div key={`${user.id}-${index}`} className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 flex flex-col items-center">
//               <span className="text-sm text-zinc-400 self-start mb-2 font-mono">
//                 #{index + 1}
//               </span>
//               <div className="relative w-24 h-24 mb-4">
//                 <img
//                   src={user.avatar}
//                   alt={`${user.name}'s avatar`}
//                   sizes="100px"
//                   className="rounded-full object-cover"
//                 />
//               </div>
//               <h2 className="text-xl font-semibold text-center">{user.name}</h2>
//               <p className="text-gray-500 text-sm mt-1">User ID: #{user.id}</p>
//             </div>
//           );
//         })}
//       </div>
//       <form action={updateList}>
//         <button type="submit">Refresh Users</button>
//       </form> 
//     </div>
//   );
// }


export default function Home(){
  return(
    <>
    <h1>Users Directory</h1>
    <Suspense fallback={<p>Loading Users....</p>}>
      {/* <UserList/>  */}
      <UserManagement/>
    </Suspense>
    </>
  )
}