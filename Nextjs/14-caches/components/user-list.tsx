// import { getUsers } from '@/app/lib/user';
// import React from 'react'

// const UserList = async() => {
//     const users = await getUsers();
//   return (
//     <div className="gird gap-4">
//         {users.map((user:any)=>(
//             <div key={user.id} className="p-4 border rounded">
//                 <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full"/>
//                 <h2>{user.name}</h2>
//                 <p className="text-sm text-gray-500">
//                     Joined {new Date(user.createdAt).toLocaleDateString()}
//                 </p>
//             </div>
//         ))}
//     </div>
//   )
// }

// export default UserList