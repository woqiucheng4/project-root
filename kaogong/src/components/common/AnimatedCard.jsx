"use client";
import React from "react";

export default function AnimatedCard({ children, style = {}, className = "", delay = 0 }) {
  return (
    <div 
      className={`glass-panel ${className}`} 
      style={{
        ...style,
        animation: `fadeIn 0.6s ease forwards ${delay}s`,
        opacity: 0,
        transform: 'translateY(10px)',
        padding: 'var(--spacing-lg)',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
      }}
    >
      {children}
    </div>
  );
}
