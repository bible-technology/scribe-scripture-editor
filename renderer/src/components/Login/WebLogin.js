'use client';

import SignIn from './Signin';
import RightLogin from './RightLogin';

export default function WebLogin() {
  return (
    <div className="grid grid-cols-7 h-screen">
      <div className="col-span-3 justify-center items-center h-full relative">
        <SignIn />
      </div>
      <RightLogin />
    </div>
  );
}
