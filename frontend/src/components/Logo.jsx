// frontend/src/components/Logo.jsx
import React from 'react';
import markImg from '../assets/pillar5-mark.png';
import fullImg from '../assets/pillar5-logo.png';

// variant "mark" = crest icon only (square-ish, for header/sidebar/auth badges)
// variant "full" = crest + wordmark (for hero / large brand moments)
export default function Logo({ variant = 'mark', alt = 'Pillar 5 Group', style, className = '' }) {
  const src = variant === 'full' ? fullImg : markImg;
  return <img src={src} alt={alt} className={`logo-img ${className}`} style={style} />;
}
