"use client"; // 👈 This must be the very first line, before any imports

import React, { useState } from 'react';
import { addUser, deleteUser } from '@/actions';

interface User {
  id: string;
  name: string;
  avatar: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !avatar) return alert('Please fill in all fields');

    setIsLoading(true);
    try {
      await addUser(name, avatar);
      
      const newUser = { id: Date.now().toString(), name, avatar };
      setUsers([...users, newUser]);
      
      setName('');
      setAvatar('');
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">User Directory</h2>

      {/* Add User Form */}
      <form onSubmit={handleAdd} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Add User'}
        </button>
      </form>

      {/* User List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Users ({users.length})</h3>
        {users.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No users added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://dicebear.com{user.name}`;
                    }}
                  />
                  <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={isLoading}
                  className="text-red-500 hover:text-red-700 text-xs font-medium p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
