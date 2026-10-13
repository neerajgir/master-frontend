import { createTodo } from "@/actions/action";

export default function Home() {
  // async function createTodo(formData) {
  //   "use server";
  //   const title = formData.get("title")
  //   console.log("creating todo", title)
  // }
  return (
    <form action={createTodo}>
      <input name="title"/>
      <button type="submit">Add Todo</button>
    </form>
  );
}
