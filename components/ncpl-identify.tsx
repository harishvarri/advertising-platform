'use client';
import { useEffect } from 'react';

// Pass the user info your app ALREADY has (from your session/context).
// No database query, no RLS policy needed — so it can never be blocked.
export function NcplIdentify({ id, name, email }:
  { id: string; name?: string; email?: string }) {
  useEffect(() => {
    let tries = 0;
    const fire = () => {
      const w = window as any;
      if (w.ncpl) { w.ncpl('identify', id, { name, email }); return; }
      if (tries++ < 30) setTimeout(fire, 100); // wait for ncpl.js to load
    };
    fire();
  }, [id, name, email]);
  return null;
}

// ── Then use it where the user is already available: ──
// import { NcplIdentify } from '@/components/ncpl-identify';
// <NcplIdentify id={user.id} name={user.full_name} email={user.email} />
