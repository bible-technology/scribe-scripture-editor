import React from 'react';

function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  ...props
}) {
  return (
    <button
      // eslint-disable-next-line react/button-has-type
      type={type}
      className="border border-primary/30 inline-flex items-center justify-center rounded-[4px] px-4 py-2
        shadow-sm hover:bg-primary hover:text-white hover:font-medium "
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
