import React from 'react';

export const NSDLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00c8ff"/>
        <stop offset="100%" stopColor="#0066ff"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="18" fill="#060c18" stroke="rgba(0,200,255,0.3)" strokeWidth="1"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,200,255,0.15)" strokeWidth="1"/>
    <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(0,200,255,0.3)" strokeWidth="1.5"/>
    <circle cx="50" cy="50" r="7"  fill="#00c8ff" opacity="0.9"/>
    <line x1="20" y1="50" x2="43" y2="50" stroke="#00c8ff" strokeWidth="1.5" opacity="0.6"/>
    <line x1="57" y1="50" x2="80" y2="50" stroke="#00c8ff" strokeWidth="1.5" opacity="0.6"/>
    <line x1="50" y1="20" x2="50" y2="43" stroke="#00c8ff" strokeWidth="1.5" opacity="0.6"/>
    <line x1="50" y1="57" x2="50" y2="80" stroke="#00c8ff" strokeWidth="1.5" opacity="0.6"/>
    <line x1="29" y1="29" x2="43" y2="43" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
    <line x1="57" y1="57" x2="71" y2="71" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
    <line x1="71" y1="29" x2="57" y2="43" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
    <line x1="29" y1="71" x2="43" y2="57" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
    <circle cx="20" cy="50" r="3.5" fill="url(#lg1)"/>
    <circle cx="80" cy="50" r="3.5" fill="url(#lg1)"/>
    <circle cx="50" cy="20" r="3.5" fill="url(#lg1)"/>
    <circle cx="50" cy="80" r="3.5" fill="url(#lg1)"/>
    <circle cx="29" cy="29" r="2.5" fill="#8b5cf6"/>
    <circle cx="71" cy="71" r="2.5" fill="#8b5cf6"/>
    <circle cx="71" cy="29" r="2.5" fill="#8b5cf6"/>
    <circle cx="29" cy="71" r="2.5" fill="#8b5cf6"/>
  </svg>
);
