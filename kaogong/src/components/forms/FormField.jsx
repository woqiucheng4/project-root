"use client";
import React from 'react';

export default function FormField({ name, definition, value, onChange, error }) {
  const { type, label, options, placeholder, required } = definition;

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${error ? '#ef4444' : 'var(--glass-border)'}`,
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (type === 'number') val = val === '' ? '' : Number(val);
    if (type === 'radio') val = val === 'true';
    onChange(name, val);
  };

  return (
    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      
      {type === 'text' || type === 'number' ? (
        <input
          type={type}
          value={value === undefined ? '' : value}
          onChange={handleChange}
          placeholder={placeholder}
          style={inputStyle}
          className="form-input"
        />
      ) : type === 'select' ? (
        <select
          value={value === undefined ? '' : value}
          onChange={handleChange}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          className="form-input"
        >
          <option value="" disabled>请选择...</option>
          {options.map((opt, i) => (
            <option key={i} value={opt} style={{ color: '#000' }}>{opt}</option>
          ))}
        </select>
      ) : type === 'radio' ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {options.map((opt, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={handleChange}
                style={{ cursor: 'pointer', accentColor: 'var(--primary-color)', width: '18px', height: '18px' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : null}

      {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>{error}</div>}
    </div>
  );
}
