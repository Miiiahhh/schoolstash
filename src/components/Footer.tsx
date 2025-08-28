// src/components/Footer.tsx
import React from 'react';
import '../theme.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container p-3" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'.75rem'}}>
        <small>Feito com <strong>School Stash Hub</strong> • SESI</small>
        <small style={{opacity:.7}}>© {new Date().getFullYear()}</small>
      </div>
    </footer>
  );
}
