"use client";
import React, { useState } from 'react'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTodo } from '@/actions/todo-action';
import { toast } from 'sonner';


export const TodoForm = () => {
    const queryClient = useQueryClient()
    const [title , setTitle] = useState("");
    const mutation = useMutation({
        mutationFn:(data)=>addTodo(data),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["todos"]})
            toast.success("Todo Added successfully")
        },
        onError:(error)=>{
            toast.error("failed to add todo")
        }
    })

    const handleSubmit = async(e)=>{
        e.preventDefault();

         mutation.mutate({title},{
            onSuccess:()=>{
                setTitle("")
            }
         })
    }

  return (
    <form onSubmit={handleSubmit} className='flex gap-2 mb-8'>
        <Input
        type={"text"}
            value={title}
            placeholder="Add a new Task"
            onChange={(e)=>setTitle(e.target.value)}
            className={"flex-1"}
            disabled={mutation.isPending}
        />

        <Button type="submit">
            <Plus size={20} className='mr-2'/>
         {
            mutation.isPending ? "Adding..." : "Add"
         }
        </Button>
    </form>
  )
}