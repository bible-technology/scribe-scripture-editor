import React from 'react';

function SliderItem({ index, activeIndex, children }) {
  const offset = (index - activeIndex) / 4;
  const direction = Math.sign(index - activeIndex);
  const absOffset = Math.abs(offset);

  const cssTransformProperties = `
        rotateY(calc(${offset} * 55deg))
        scaleY(calc(1 +  ${absOffset}  * -0.5))
        translateX(calc( ${direction} * -3.5rem))
        translateZ(calc( ${absOffset} * -35rem))
       `;

  const cssOpacity = `
        ${Math.abs(index - activeIndex) >= 3 ? '0' : '1'}`;

  const cssDisplay = `
        ${Math.abs(index - activeIndex) >= 3 ? 'none' : 'block'},
  `;

  return (
    <div
      role="button"
      tabIndex={-1}
      className="absolute h-full w-full  overflow-hidden rounded-xl
        drop-shadow-[0_8px_30px_rgb(255,255,255,0.12)] transition-all duration-500 ease-in-out"
      style={{
        transform: cssTransformProperties,
        opacity: cssOpacity,
        display: cssDisplay,
        zIndex: `${1}`,
      }}
    >
      {children}
    </div>
  );
}

export default SliderItem;
