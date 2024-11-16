import React from 'react';

interface UserAvatarProps {
  onClick: () => void;
}

export default function UserAvatar({ onClick }: UserAvatarProps) {
  const name = localStorage.getItem('userName') || 'Guest User';
  const avatar = localStorage.getItem('userAvatar');
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={onClick}
      className="h-8 w-8 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '';
            localStorage.removeItem('userAvatar');
          }}
        />
      ) : (
        <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
          <span className="text-sm font-medium text-indigo-600">{initials}</span>
        </div>
      )}
    </button>
  );
}