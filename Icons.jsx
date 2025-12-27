import React from 'react'

export const PatternIcon = ({ size = 32, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="8" cy="8" r="3" fill={color} opacity="0.9"/>
    <circle cx="16" cy="8" r="3" fill={color} opacity="0.5"/>
    <circle cx="24" cy="8" r="3" fill={color} opacity="0.9"/>
    <circle cx="8" cy="16" r="3" fill={color} opacity="0.5"/>
    <circle cx="16" cy="16" r="3" fill={color} opacity="0.9"/>
    <circle cx="24" cy="16" r="3" fill={color} opacity="0.5"/>
    <circle cx="8" cy="24" r="3" fill={color} opacity="0.9"/>
    <circle cx="16" cy="24" r="3" fill={color} opacity="0.5"/>
    <circle cx="24" cy="24" r="3" fill={color} opacity="0.9"/>
  </svg>
)

export const SwitcherIcon = ({ size = 32, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M8 10L24 10M20 6L24 10L20 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
    <path d="M24 22L8 22M12 18L8 22L12 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
)

export const ClarityIcon = ({ size = 32, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="6" fill="none" stroke={color} strokeWidth="2.5" opacity="0.9"/>
    <circle cx="16" cy="16" r="2" fill={color}/>
  </svg>
)

export const BackIcon = ({ size = 24, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ChevronIcon = ({ size = 16, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const FlameIcon = ({ size = 20, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 2C10 2 6 6 6 10C6 13 8 15 10 15C8 13 9 11 10 10C11 11 12 13 10 15C12 15 14 13 14 10C14 6 10 2 10 2Z" fill={color}/>
  </svg>
)
