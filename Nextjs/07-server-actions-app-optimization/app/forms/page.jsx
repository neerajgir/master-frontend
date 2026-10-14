"use client"
import { submitUser } from '@/actions/action';
import Form from 'next/form';
import {useRouter}  from 'next/navigation'
import React from 'react'

const FormPage = () => {
  const router = useRouter();
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
        <button onClick={()=>router.back()}>Go Back</button>
    </div>
  )
}

export default FormPage