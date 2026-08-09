import React from 'react'
import ClientsList from './clientsList'

export default function page() {
  return (
    <div className="flex min-h-svh w-full  justify-center p-3 md:px-10">
      <div className="w-full ">
        <ClientsList />
      </div>
    </div>
  );
}
