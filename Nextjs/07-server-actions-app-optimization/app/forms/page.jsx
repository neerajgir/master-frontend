import { submitUser } from '@/actions/action';
import Form from 'next/form';
import React from 'react'

const FormPage = () => {
  return (
    <div>
        <h1>Create User</h1>
        <Form action={submitUser}>
            <input type="text" name="name" placeholder="Enter Name"/>
            <input type="email" name="email" placeholder="Enter Email"/>
            <button type="submit">Submit</button>
        </Form>
        <h1>Search Form</h1>
        <Form action={"/search"}>
            <input type="text" name="query" placeholder="Search post-id" />
            <button type="submit">Search</button>
        </Form>
    </div>
  )
}

export default FormPage