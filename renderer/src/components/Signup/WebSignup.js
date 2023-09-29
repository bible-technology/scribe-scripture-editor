'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseSettingJson, createWebUser } from '@/core/Login/handleLogin';
import { environment } from '../../../environment';
import { supabaseSignup, newPath } from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const newPath = require('../../../../supabase').newPath
//   const supabase = require('../../../../../supabase').supabase
// }

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password);

    const { data, error } = await supabaseSignup({
      email,
      password,
    });
    if (data) {
      createSupabaseSettingJson(`${newPath}/${data.user.email}/${environment.USER_SETTING_FILE}`);
      console.log('signup successful', data);
      setStatus('Check your email for the confirmation link.');
      createWebUser(data.user);
      router.push('/login');
    } else {
      console.error('error occured', error);
      setStatus(error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {status && <p className="text-red-500 text-sm mb-4">{status}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-orange-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignupPage;
