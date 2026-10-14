"use server"

export async function createTodo(formData) {
    const title = formData.get("title")
    console.log("creating todo", title)
}

export async function updateTodo(title, desc, isCompleted) {
    const newData = {
        title,
        desc,
        isCompleted
    }

    //db call
    return {
        success: true,
        message: "Update Successfully", newData
    }
}

export async function submitUser(formData) {
    const name = formData.get("name")
    const email = formData.get("email")
    console.log("Submit user data", name, email)
}