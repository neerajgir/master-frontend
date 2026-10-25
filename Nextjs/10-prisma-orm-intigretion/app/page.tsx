import { createUser, getAllUser } from "@/actions/action";


export default async function Home() {
  const data = await getAllUser();
  console.log(data)
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Create User</h1>
      <form action={createUser}>
        <input
        type="text"
        name="name"
        placeholder="Enter Name."
        required
        />

        <input 
        type="text" 
        name="email"
        placeholder="Enter Your Email"
        required
        />

        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
