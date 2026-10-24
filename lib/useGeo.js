'use client';
import { useEffect, useState } from 'react';
import { api } from './api';

let cache = null; // states and LGAs rarely change, so fetch once per page load

export function useGeo() {
  const [geo, setGeo] = useState(cache);
  useEffect(() => {
    if (!cache) api('/geo').then((r) => { cache = r.data; setGeo(r.data); }).catch(() => {});
  }, []);
  return {
    states: geo ? geo.map((g) => g.state) : [],
    lgasOf: (state) => geo?.find((g) => g.state === state)?.lgas || [],
  };
}
