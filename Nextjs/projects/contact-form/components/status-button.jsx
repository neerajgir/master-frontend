"use client";

import { updateStatus } from "@/actions/contact";
import Form from "next/form";

const StatusButton = ({id}) => {
    const action = updateStatus.bind(null, id)
  return (
    <Form action={action}>
        <button className="bg-green-500 text-white px-3 py-1 mt-2">
            Mark Resolved
        </button>
    </Form>
  )
}

export default StatusButton