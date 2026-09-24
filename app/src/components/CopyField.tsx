'use client';
import { useState } from 'react';

export function CopyField({ value, label, multiline }: { value: string; label: string; multiline?: boolean }) {
  const [done, setDone] = useState(false);
  const id = `cf-${label.replace(/\W+/g, '-')}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.select();
      document.execCommand('copy');
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }
  return (
    <div className="copybox" style={multiline ? { alignItems: 'flex-start' } : undefined}>
      {multiline ? (
        <textarea id={id} className="textarea" style={{ minHeight: 120, fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }} readOnly value={value} aria-label={label} onFocus={(e) => e.currentTarget.select()} />
      ) : (
        <input id={id} className="input" readOnly value={value} aria-label={label} onFocus={(e) => e.currentTarget.select()} />
      )}
      <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{done ? 'Copié ✓' : 'Copier'}</button>
    </div>
  );
}
