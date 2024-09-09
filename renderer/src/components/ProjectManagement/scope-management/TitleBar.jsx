import React from 'react';

function TitleBar({ children }) {
  return (
    <div className="w-full h-8 bg-[#f0eeee] border rounded relative my-2 flex justify-between px-3 items-center">{children}</div>
  );
}

export default TitleBar;
