"use client"; // Add this line to mark this component as a Client Component

import { useEffect, useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem('adminInfo'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className='bg-white flex items-center justify-between p-4 mb-4'>
      {/* SEARCH BAR */}
 
      {/* ICONS AND USER */}
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-sky-500 text-white rounded-full text-xs'>1</div>
        </div>
        <div className='flex flex-col'>
          {user ? (
            <>
              <span className="text-xs leading-3 font-medium">{user.username}</span>
              <span className="text-[10px] text-gray-500 text-right">{user.email}</span>
            </>
          ) : (
            <span className="text-xs leading-3 font-medium">Loading...</span>
          )}
        </div>
        <Image src="/admin.png" alt="" width={36} height={36} className="rounded-full" />
      </div>
    </div>
  );
};

export default Navbar;
