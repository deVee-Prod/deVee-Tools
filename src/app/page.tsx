"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';

const FileConverterApp = dynamic(() => import('./file-converter-app'), { ssr: false });

export default function Page() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return (
      <main style={{
        position: 'fixed', inset: 0, color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '24px'
      }}>
        <img src="/devee-icon-2026.png" alt="File Converter" style={{ width: 72, height: 72, objectFit: 'contain' }} />
        <h1 className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/60">
          File Converter
        </h1>
        <button
          onClick={() => setEntered(true)}
          style={{
            marginTop: '8px',
            padding: '14px 48px',
            background: 'transparent',
            border: '1px solid rgba(178,34,34,0.3)',
            color: '#b22222',
            borderRadius: '16px',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </main>
    );
  }

  return <FileConverterApp />;
}
