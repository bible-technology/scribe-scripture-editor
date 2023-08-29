import LogoIcon from '@/icons/logo.svg';
// import GroupIcon from '@/illustrations/group.svg';

// import VectorOne from '@/illustrations/vector-one.svg';
// import HalfMoon from '@/illustrations/half-moon.svg';
// import Quote from '@/illustrations/quote.svg';

export default function RightLogin() {
  return (
    <div className="col-span-4 bg-secondary relative flex flex-col justify-between">

      <div className="my-5 ml-28 mt-10 flex gap-3 items-center">
        <LogoIcon
          className="h-7 w-7 group-hover:text-primary"
          aria-hidden="true"
        />
        <div className="text-white uppercase font-bold tracking-wider text-2xl">Scribe Scripture</div>
      </div>

      <div className="flex flex-col justify-center items-center relative">

        <div className="mx-auto my-10">
          {/* <GroupIcon
            fill="#FF4A4A"
            width={52}
            height={42}
          /> */}
        </div>

        <div className="mx-10 md:mx-20 lg:mx-32 text-xl text-white leading-9 relative">
          <div className="absolute top-0 left-0">
            {/* <Quote height={26} fill="#FF4A4A" /> */}
          </div>

          <div className="py-10">
            <p className="text-md">A Bible translation editor that is owned by and developed for the community which uses modern technology to solve the practical problems faced on the field in the current Bible translation context.</p>
            <p className="flex gap-2 mt-4 font-semibold items-center">
              <span className="text-lg">FEATURE 1</span>
              <img src="/../illustrations/greenCheck.png" className="w-4 h-4" alt="" />

            </p>
          </div>

        </div>

        <div className="flex ">
          <div className="">
            <img src="/../illustrations/standing.png" alt="" />

          </div>
          <div>
            {/* <VectorOne
              width={34}
              height={33}
              fill="#FF4A4A"
            /> */}
          </div>
        </div>
        <div className="mt-12 flex gap-4">
          <span className="h-2 w-2 rounded-full bg-white " />
          <span className="h-2 w-2 rounded-full bg-gray-500" />
          <span className="h-2 w-2 rounded-full bg-gray-500" />
        </div>

      </div>

      <div className="">
        {/* <HalfMoon width={124} height={70} /> */}

      </div>

    </div>
  );
}
