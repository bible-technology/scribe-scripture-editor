// minimum 3 data
import React, { useEffect, useState } from 'react';
import SliderItem from './SliderItem';

function Slider({
  data,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(true); // true -> right false -> left

  function handleNextItemBtn() {
    setActiveIndex((prev) => (prev + 1 < data.length ? prev + 1 : prev));
  }

  function handlePrevItemBtn() {
    setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (direction) {
        if (activeIndex + 1 >= data.length) {
          setDirection(false);
        }
        handleNextItemBtn();
      } else {
        if (activeIndex - 1 <= 0) {
          setDirection(true);
        }
        handlePrevItemBtn();
      }
    }, [2500]);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative mt-10 xl:mt-12">
      <div
        className="relative h-32 w-3/6 md:h-44 xl:h-72 2xl:h-96"
        style={{
      perspective: '550px',
      transformStyle: 'preserve-3d',
    }}
      >
        {activeIndex > 0 && (
        <button
          type="button"
          className="absolute z-40 flex h-8 w-8 cursor-pointer items-center justify-center
            rounded-full border-2 border-[#302e30] bg-[#181818] text-2xl opacity-75 transition duration-300 hover:opacity-100 md:h-12 md:w-12
            right-1/2 top-1/2 translate-x-[-150px] translate-y-[-50%] transform lg:translate-x-[-190px] xl:translate-x-[-260px] 2xl:translate-x-[-350px]"
          onClick={handlePrevItemBtn}
        >
          &lt;
        </button>
      )}
        {data?.map((item, index) => (
          <SliderItem key={item.id} index={index} activeIndex={activeIndex}>
            {item.img}
          </SliderItem>
      ))}
        {activeIndex < data.length - 1 && (
        <button
          type="button"
          className="absolute z-40 flex h-9 w-9 cursor-pointer items-center justify-center
      rounded-full border-2 border-[#302e30] bg-[#181818] text-2xl opacity-75 transition duration-300 hover:opacity-100 md:h-12 md:w-12
      top-1/2 left-1/2 translate-x-[150px] translate-y-[-50%] transform lg:translate-x-[190px] xl:translate-x-[260px] 2xl:translate-x-[350px]"
          onClick={handleNextItemBtn}
        >
          &gt;
        </button>
      )}
      </div>

      <div className="mt-6 text-center max-w-[21rem] lg:max-w-lg lg:mt-8 xl:mt-9">
        <h4>{data[activeIndex].title}</h4>
        <p className="mt-2 text-sm">{data[activeIndex].content}</p>
      </div>
    </div>
  );
}

export default Slider;
