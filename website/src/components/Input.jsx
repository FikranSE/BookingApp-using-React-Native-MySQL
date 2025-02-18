// components/Input.jsx
import React from 'react';
import { useStateContext } from '../contexts/ContextProvider';

const Input = ({ 
  bgColor, 
  color, 
  borderRadius, 
  size, 
  width,
  placeholder,
  type = 'text',
  onChange
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      style={{ 
        backgroundColor: bgColor, 
        color, 
        borderRadius,
        width: width || '100%'
      }}
      className={`p-3 text-${size} border border-gray-200 focus:outline-none focus:border-gray-400 hover:drop-shadow-sm`}
    />
  );
};

export default Input;