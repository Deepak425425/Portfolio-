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
    members: Array.isArray(saved.members)
      ? saved.members.map((m: any, idx: number) => ({
          id: m.id || String(idx + 2).padStart(2, '0'),
          name: m.name ?? '',
          role: m.role ?? '',
          ref: m.ref ?? `BENCH // ${String(idx + 1).padStart(2, '0')}`,
          department: m.department ?? 'STUDIO POSITION',
          discipline: m.discipline ?? m.department ?? 'STUDIO POSITION',
          hasPin: m.hasPin !== false,
          pinColor: m.pinColor || 'purple',
          tag: m.tag ?? m.status ?? '',
          status: m.status ?? m.tag ?? '',
          bg: m.bg || '#F5F2FF',
          textColor: m.textColor || '#6D28D9',
          borderColor: m.borderColor || '#DDD6FE',
          rotationClass: m.rotationClass || 'rotate-0 sm:rotate-[1.0deg] lg:translate-y-2 hover:rotate-0 hover:translate-y-0',
          note: m.note ?? m.description ?? '',
          description: m.description ?? m.note ?? '',
          image: m.image ?? '',
          ...m,
        }))
      : DEFAULT_TEAM_DATA.members,
    join: {
      ...DEFAULT_TEAM_DATA.join,
      ...(saved.join || {})
    }
  };
}

export async function getTeamData(): Promise<TeamData> {
  if (memoryCache) return memoryCache;

  // 1. Try Vercel Blob if token is set
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

  // 2. Try /tmp/team.json on Vercel
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

  // 3. Try bundled data/team.json
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
