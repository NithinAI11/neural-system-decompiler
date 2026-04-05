import React from 'react';

export const NSDLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#09090b"/>
    <path d="M25 50L45 25V75L25 50Z" fill="#6366f1" opacity="0.8"/>
    <path d="M75 50L55 25V75L75 50Z" fill="#10b981" opacity="0.8"/>
    <circle cx="50" cy="50" r="15" fill="#18181b" stroke="#ffffff" strokeWidth="4"/>
    <circle cx="50" cy="50" r="6" fill="#f43f5e"/>
  </svg>
);