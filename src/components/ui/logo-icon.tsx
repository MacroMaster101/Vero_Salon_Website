import React from 'react';

export function LogoIcon({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Vero Salon Logo"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        objectFit: 'contain', // Fits the square logo perfectly inside the container
        display: 'block'
      }}
    />
  );
}
