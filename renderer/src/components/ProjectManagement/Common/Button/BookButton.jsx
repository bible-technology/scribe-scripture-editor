import React from 'react';

function BookButton({
  onClick,
  children,
  disabled = false,
  className = '',
  ...props
}) {
  const buttonClasses = `py-1 px-2 hover:bg-primary hover:text-white hover:font-bold cursor-pointer rounded text-left ${className} `;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}

export default BookButton;
