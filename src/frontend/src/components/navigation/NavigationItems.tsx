import React from 'react';

export const NavigationItems = () => {
  return (
    <ul>
      <li className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">Dashboard</li>
      <li className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">Noodles</li>
      <li className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">Collections</li>
      <li className="p-2 hover:bg-gray-100 rounded-md cursor-pointer">Settings</li>
    </ul>
  );
};