import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';
import { TeamData, DEFAULT_TEAM_DATA } from './teamTypes';

export * from './teamTypes';

const isVercel = process.env.VERCEL === '1';

let memoryCache: TeamData | null = null;

function mergeWithDefaults(saved: any): TeamData {
  if (!saved || typeof saved !== 'object') return DEFAULT_TEAM_DATA;
  return {
    intro: {
      ...DEFAULT_TEAM_DATA.intro,
      ...(saved.intro || {})
    },
    founder: {
      ...DEFAULT_TEAM_DATA.founder,
      ...(saved.founder || {}),
      expertise: Array.isArray(saved.founder?.expertise)
        ? saved.founder.expertise
        : DEFAULT_TEAM_DATA.founder.expertise
    },
    members: Array.isArray(saved.members) && saved.members.length > 0
      ? saved.members.map((m: any, idx: number) => {
          const defaultMember = DEFAULT_TEAM_DATA.members[idx] || {};
          return {
            ...defaultMember,
            ...m,
            id: m.id || String(idx + 2).padStart(2, '0')
          };
        })
      : DEFAULT_TEAM_DATA.members,
    join: {
      ...DEFAULT_TEAM_DATA.join,
      ...(saved.join || {})
    }
  };
}

export async function getTeamData(): Promise<TeamData> {
  // 1. Try bundled data/team.json first if not using Blob (instant local updates)
  const bundledPath = path.join(process.cwd(), 'data', 'team.json');
  if (fs.existsSync(bundledPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
      if (saved && typeof saved === 'object') {
        const merged = mergeWithDefaults(saved);
        memoryCache = merged;
        return merged;
      }
    } catch {}
  }

  if (memoryCache) return memoryCache;

  // 2. Try Vercel Blob if token is set
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: 'studio/team.json' });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' });
        if (res.ok) {
          const blobData = await res.json();
          if (blobData && typeof blobData === 'object') {
            const merged = mergeWithDefaults(blobData);
            memoryCache = merged;
            return merged;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read team.json from Blob:', e);
    }
  }

  // 3. Try /tmp/team.json on Vercel
  const tmpPath = path.join('/tmp', 'team.json');
  if (isVercel && fs.existsSync(tmpPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (saved && typeof saved === 'object') {
        const merged = mergeWithDefaults(saved);
        memoryCache = merged;
        return merged;
      }
    } catch {}
  }

  memoryCache = DEFAULT_TEAM_DATA;
  return DEFAULT_TEAM_DATA;
}

export function getTeamDataSync(): TeamData {
  if (memoryCache) return memoryCache;

  const tmpPath = path.join('/tmp', 'team.json');
  if (isVercel && fs.existsSync(tmpPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (saved && typeof saved === 'object') return mergeWithDefaults(saved);
    } catch {}
  }

  const bundledPath = path.join(process.cwd(), 'data', 'team.json');
  if (fs.existsSync(bundledPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
      if (saved && typeof saved === 'object') return mergeWithDefaults(saved);
    } catch {}
  }

  return DEFAULT_TEAM_DATA;
}

export async function updateTeamData(data: TeamData): Promise<TeamData> {
  const merged = mergeWithDefaults(data);
  memoryCache = merged;

  // 1. Write to /tmp/team.json on Vercel
  if (isVercel) {
    try {
      fs.writeFileSync(path.join('/tmp', 'team.json'), JSON.stringify(merged, null, 2));
    } catch (e) {
      console.warn('Could not write /tmp/team.json', e);
    }
  }

  // 2. Write to bundled data/team.json if writable
  try {
    const bundledPath = path.join(process.cwd(), 'data', 'team.json');
    if (!fs.existsSync(path.dirname(bundledPath))) {
      fs.mkdirSync(path.dirname(bundledPath), { recursive: true });
    }
    fs.writeFileSync(bundledPath, JSON.stringify(merged, null, 2));
  } catch (e) {
    console.warn('Could not write data/team.json', e);
  }

  // 3. Persist to Vercel Blob if available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put('studio/team.json', JSON.stringify(merged, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });
    } catch (e) {
      console.error('Failed to persist team.json to Vercel Blob:', e);
    }
  }

  return merged;
}
