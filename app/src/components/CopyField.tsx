'use client';
import { useState } from 'react';

export function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.getElementById(`cf-${label}`) as HTMLInputElement | null;
      el?.select();
      document.execCommand('copy');
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }
  return (
    <div className="copybox">
      <input id={`cf-${label}`} className="input" readOnly value={value} aria-label={label} onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{done ? 'Copié ✓' : 'Copier'}</button>
    </div>
  );
}
