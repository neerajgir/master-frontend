import StatusButton from '@/components/status-button'; 
import { connectDB } from '@/lib/db'; 
import Contact from '@/lib/models/Contact'; 
import React from 'react';

const Dashboard = async () => { 
  await connectDB(); 
  const contacts = await Contact.find().lean(); 

  return ( 
    <div className="p-10"> 
      <h1 className="text-2xl mb-6"> Contact Messages </h1> 
      {contacts.map((contact) => ( 
        <div key={contact._id.toString()} className="border p-4 mb-4"> 
          <h3>{contact.name}</h3> 
          <p>{contact.email}</p> 
          <p>{contact.message}</p> 
          {contact.status === "resolved" ? (
            <p className="text-green-400">{contact.status}</p> 
          ) : (
            <StatusButton id={contact._id.toString()} />
          )} 
        </div> 
      ))} 
    </div> 
  ); 
}; 

export default Dashboard;
