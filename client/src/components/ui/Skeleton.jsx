import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'text', // text | circular | rectangular
  width,
  height,
}) => {
  const variants = {
    text: 'rounded-full h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-2xl',
  };

  return (
    <div
      style={{ width, height }}
      className={`animate-pulse bg-[#ECEEF7] ${variants[variant]} ${className}`}
    />
  );
};
