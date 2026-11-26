import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response, type NextFunction } from 'express';

export interface AdminOverrides {
  tracks: Record<string, any>;
  playlists: Record<string, any>;
  categories: Record<string, any>;
  languages: Record<string, any>;
  updatedAt: string;
}

const DEFAULT_OVERRIDES: AdminOverrides = {
  tracks: {},
  playlists: {},
  categories: {},
  languages: {},
  updatedAt: new Date(0).toISOString(),
};

function getOverridesFilePath(): string {
  const localDir = path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    fs.accessSync(localDir, fs.constants.W_OK);
    return path.join(localDir, 'admin-overrides.json');
  } catch {
    return path.join('/tmp', 'moodify-admin-overrides.json');
  }
}

function readOverrides(): AdminOverrides {
  const filePath = getOverridesFilePath();
  try {
    if (!fs.existsSync(filePath)) return { ...DEFAULT_OVERRIDES };
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      tracks: parsed.tracks || {},
      playlists: parsed.playlists || {},
      categories: parsed.categories || {},
      languages: parsed.languages || {},
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return { ...DEFAULT_OVERRIDES };
  }
}

function writeOverrides(next: AdminOverrides): AdminOverrides {
  const filePath = getOverridesFilePath();
  const payload = { ...next, updatedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim() || '';
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim() || '';
  const passwordPlain = process.env.ADMIN_PASSWORD?.trim() || '';
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() || crypto.createHash('sha256').update(username + ':' + (passwordHash || passwordPlain || 'ephemeral')).digest('hex');
  const configured = Boolean(username && (passwordHash || passwordPlain));
  return { username, passwordHash, passwordPlain, sessionSecret, configured };
}

function timingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function signToken(username: string, secret: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string | undefined, secret: string): { valid: boolean; username?: string } {
  if (!token || !token.includes('.')) return { valid: false };
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return { valid: false };
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!timingSafeMatch(sig, expectedSig)) return { valid: false };
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.u || typeof decoded.exp !== 'number' || decoded.exp < Date.now()) {
      return { valid: false };
    }
    return { valid: true, username: decoded.u };
  } catch {
    return { valid: false };
  }
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const cfg = getAdminConfig();
    if (!cfg.configured) {
      res.status(503).json({ error: 'Yönetici ortam değişkenleri yapılandırılmamış.' });
      return;
    }
    const cookies = parseCookies(req);
    const verified = verifyToken(cookies['moodify_admin_session'], cfg.sessionSecret);
    if (!verified.valid) {
      res.status(401).json({ error: 'Yetkisiz erişim. Yönetici oturumu gerekli.' });
      return;
    }
    next();
  };

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'moodify-api', timestamp: new Date().toISOString() });
  });

  app.get('/api/admin/session', (req, res) => {
    const cfg = getAdminConfig();
    if (!cfg.configured) {
      res.json({ authenticated: false, configured: false });
      return;
    }
    const cookies = parseCookies(req);
    const verified = verifyToken(cookies['moodify_admin_session'], cfg.sessionSecret);
    res.json({
      authenticated: verified.valid,
      configured: true,
      username: verified.valid ? verified.username : undefined,
    });
  });

  app.post('/api/admin/login', (req, res) => {
    const cfg = getAdminConfig();
    if (!cfg.configured) {
      res.status(503).json({
        error: 'Sunucu tarafı admin kimlik bilgileri (ADMIN_USERNAME, ADMIN_PASSWORD veya ADMIN_PASSWORD_HASH) ortam değişkenlerinde tanımlı değil.',
      });
      return;
    }

    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
      return;
    }

    const expectedHash = cfg.passwordHash
      ? cfg.passwordHash.toLowerCase()
      : crypto.createHash('sha256').update(cfg.passwordPlain).digest('hex');
    const providedHash = crypto.createHash('sha256').update(password).digest('hex');

    const userOk = timingSafeMatch(username.trim(), cfg.username);
    const passOk = timingSafeMatch(providedHash, expectedHash);

    if (!userOk || !passOk) {
      res.status(401).json({ error: 'Yönetici kullanıcı adı veya şifre hatalı.' });
      return;
    }

    const token = signToken(cfg.username, cfg.sessionSecret);
    const isSecure = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('moodify_admin_session', token, {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
      maxAge: 1000 * 60 * 60 * 12,
      path: '/',
    });
    res.json({ authenticated: true, username: cfg.username });
  });

  app.post('/api/admin/logout', (req, res) => {
    const isSecure = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
    res.clearCookie('moodify_admin_session', {
      httpOnly: true,
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
      path: '/',
    });
    res.json({ ok: true });
  });

  // Cached Album & Single Artwork Lookup (iTunes Search Public API)
  const artworkCache = new Map<string, { coverUrl: string | null; releaseType: 'single' | 'album' | null }>();
  const normText = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\(.*?\)|\[.*?\]/g, ' ')
      .replace(/[^a-z0-9\u0400-\u04ff\u0600-\u06ff\u0370-\u03ff\u3040-\u30ff\u4e00-\u9faf\uac00-\ud7af]+/gi, ' ')
      .trim();

  app.get('/api/artwork', async (req, res) => {
    const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    const artist = typeof req.query.artist === 'string' ? req.query.artist.trim() : '';
    const album = typeof req.query.album === 'string' ? req.query.album.trim() : '';
    if (!title || !artist) {
      res.status(400).json({ coverUrl: null, releaseType: null });
      return;
    }
    const primaryArtist = artist.split(/[,&]|ft\.|feat\./i)[0].trim();
    const cacheKey = `${title.toLowerCase()}::${primaryArtist.toLowerCase()}::${album.toLowerCase()}`;
    if (artworkCache.has(cacheKey)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.json(artworkCache.get(cacheKey));
      return;
    }

    try {
      const wantsSingle = !album || album.toLowerCase() === 'single';
      const term = wantsSingle ? `${title} ${primaryArtist}` : `${title} ${primaryArtist} ${album}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const r = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=6`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (!r.ok) {
        res.json({ coverUrl: null, releaseType: null });
        return;
      }
      const data = await r.json();
      const results: any[] = Array.isArray(data?.results) ? data.results : [];

      const nTitle = normText(title);
      const nArtist = normText(primaryArtist);
      const nAlbum = normText(album);

      let best: any = null;
      let bestScore = -1;

      for (const item of results) {
        if (!item?.artworkUrl100) continue;
        const rArtist = normText(item.artistName || '');
        const rTitle = normText(item.trackName || '');
        const rAlbum = normText(item.collectionName || '');

        const artistMatches = rArtist.includes(nArtist) || nArtist.includes(rArtist);
        const titleMatches = rTitle.includes(nTitle) || nTitle.includes(rTitle);
        if (!artistMatches || !titleMatches) continue;

        let score = 10;
        if (rArtist === nArtist) score += 10;
        if (rTitle === nTitle) score += 10;

        const isSingleRelease = rAlbum.includes('single') || rAlbum === rTitle;
        if (wantsSingle) {
          if (isSingleRelease) score += 8;
        } else if (nAlbum && (rAlbum.includes(nAlbum) || nAlbum.includes(rAlbum))) {
          score += 12;
        }

        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      }

      const rawUrl = best?.artworkUrl100;
      const coverUrl = typeof rawUrl === 'string' ? rawUrl.replace('100x100bb', '300x300bb') : null;
      const releaseType: 'single' | 'album' | null = best
        ? normText(best.collectionName || '').includes('single') || wantsSingle
          ? 'single'
          : 'album'
        : null;

      const payload = { coverUrl, releaseType };
      if (artworkCache.size > 3000) {
        const firstKey = artworkCache.keys().next().value;
        if (firstKey) artworkCache.delete(firstKey);
      }
      artworkCache.set(cacheKey, payload);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.json(payload);
    } catch {
      res.json({ coverUrl: null, releaseType: null });
    }
  });

  // Public catalog overrides (read by all clients)
  app.get('/api/catalog/overrides', (_req, res) => {
    res.json(readOverrides());
  });

  // Admin Track CRUD
  app.post('/api/admin/tracks', requireAdmin, (req, res) => {
    const track = req.body;
    if (!track || typeof track.title !== 'string' || !track.title.trim() || typeof track.artist !== 'string' || !track.artist.trim()) {
      res.status(400).json({ error: 'Şarkı adı ve sanatçı zorunludur.' });
      return;
    }
    const id = typeof track.id === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(track.id)
      ? track.id
      : `adm_${Date.now().toString(36)}`;

    const sanitized = {
      id,
      title: track.title.trim().slice(0, 180),
      artist: track.artist.trim().slice(0, 180),
      album: typeof track.album === 'string' ? track.album.trim().slice(0, 180) : 'Single',
      genre: typeof track.genre === 'string' && track.genre.trim() ? track.genre.trim().slice(0, 64) : 'Pop',
      language: typeof track.language === 'string' && track.language.trim() ? track.language.trim().slice(0, 16) : 'tr',
      year: typeof track.year === 'number' && track.year >= 1900 && track.year <= 2100 ? track.year : null,
      coverUrl: typeof track.coverUrl === 'string' ? track.coverUrl.trim().slice(0, 500) : null,
      valence: typeof track.valence === 'number' ? Math.max(0, Math.min(1, track.valence)) : 0.5,
      energy: typeof track.energy === 'number' ? Math.max(0, Math.min(1, track.energy)) : 0.5,
      danceability: typeof track.danceability === 'number' ? Math.max(0, Math.min(1, track.danceability)) : 0.5,
      acousticness: typeof track.acousticness === 'number' ? Math.max(0, Math.min(1, track.acousticness)) : 0.3,
      tempo: typeof track.tempo === 'number' ? Math.max(40, Math.min(240, Math.round(track.tempo))) : 110,
      deleted: Boolean(track.deleted),
      audioFeaturesVerified: true,
      source: 'Yönetici Paneli',
      updatedAt: new Date().toISOString(),
    };

    const current = readOverrides();
    current.tracks[id] = sanitized;
    const saved = writeOverrides(current);
    res.json({ ok: true, track: sanitized, updatedAt: saved.updatedAt });
  });

  app.post('/api/admin/tracks/bulk', requireAdmin, (req, res) => {
    const items = req.body?.tracks;
    if (!Array.isArray(items) || items.length === 0 || items.length > 2000) {
      res.status(400).json({ error: 'Geçerli bir şarkı dizisi (1–2000 kayıt) gönderilmelidir.' });
      return;
    }
    const current = readOverrides();
    let count = 0;
    for (const item of items) {
      if (!item || typeof item.title !== 'string' || typeof item.artist !== 'string') continue;
      const title = item.title.trim().slice(0, 180);
      const artist = item.artist.trim().slice(0, 180);
      if (!title || !artist) continue;
      const id = typeof item.id === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(item.id)
        ? item.id
        : `bulk_${crypto.createHash('md5').update(`${title}::${artist}`).digest('hex').slice(0, 12)}`;
      current.tracks[id] = {
        id,
        title,
        artist,
        album: typeof item.album === 'string' ? item.album.trim().slice(0, 180) : 'Open Dataset',
        genre: typeof item.genre === 'string' && item.genre.trim() ? item.genre.trim().slice(0, 64) : 'Pop',
        language: typeof item.language === 'string' && item.language.trim() ? item.language.trim().slice(0, 16) : 'en',
        year: typeof item.year === 'number' && item.year >= 1900 && item.year <= 2100 ? item.year : null,
        coverUrl: typeof item.coverUrl === 'string' ? item.coverUrl.trim().slice(0, 500) : null,
        valence: typeof item.valence === 'number' ? Math.max(0, Math.min(1, item.valence)) : 0.5,
        energy: typeof item.energy === 'number' ? Math.max(0, Math.min(1, item.energy)) : 0.5,
        danceability: typeof item.danceability === 'number' ? Math.max(0, Math.min(1, item.danceability)) : 0.5,
        acousticness: typeof item.acousticness === 'number' ? Math.max(0, Math.min(1, item.acousticness)) : 0.3,
        tempo: typeof item.tempo === 'number' ? Math.max(40, Math.min(240, Math.round(item.tempo))) : 110,
        deleted: false,
        audioFeaturesVerified: true,
        source: typeof item.source === 'string' ? item.source.slice(0, 100) : 'Toplu Veri Seti Yükleme',
        updatedAt: new Date().toISOString(),
      };
      count++;
    }
    const saved = writeOverrides(current);
    res.json({ ok: true, importedCount: count, updatedAt: saved.updatedAt });
  });

  app.delete('/api/admin/tracks/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    const current = readOverrides();
    if (current.tracks[id]) {
      current.tracks[id].deleted = true;
    } else {
      current.tracks[id] = { id, deleted: true, updatedAt: new Date().toISOString() };
    }
    writeOverrides(current);
    res.json({ ok: true });
  });

  // Admin Playlist CRUD
  app.post('/api/admin/playlists', requireAdmin, (req, res) => {
    const pl = req.body;
    if (!pl || typeof pl.title !== 'string' || !pl.title.trim()) {
      res.status(400).json({ error: 'Çalma listesi adı zorunludur.' });
      return;
    }
    const id = typeof pl.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(pl.id)
      ? pl.id
      : `cpl_${Date.now().toString(36)}`;
    const sanitized = {
      id,
      title: pl.title.trim().slice(0, 120),
      description: typeof pl.description === 'string' ? pl.description.trim().slice(0, 300) : '',
      moodId: typeof pl.moodId === 'string' ? pl.moodId.trim().slice(0, 64) : 'happy',
      language: typeof pl.language === 'string' ? pl.language.trim().slice(0, 16) : 'all',
      coverUrl: typeof pl.coverUrl === 'string' ? pl.coverUrl.trim().slice(0, 500) : '',
      trackIds: Array.isArray(pl.trackIds) ? pl.trackIds.slice(0, 80).map(String) : [],
      featured: Boolean(pl.featured),
      updatedAt: new Date().toISOString(),
    };
    const current = readOverrides();
    current.playlists[id] = sanitized;
    writeOverrides(current);
    res.json({ ok: true, playlist: sanitized });
  });

  app.delete('/api/admin/playlists/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    const current = readOverrides();
    delete current.playlists[id];
    current.playlists[id] = { id, deleted: true, updatedAt: new Date().toISOString() };
    writeOverrides(current);
    res.json({ ok: true });
  });

  // Admin Category CRUD
  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const cat = req.body;
    if (!cat || typeof cat.name !== 'string' || !cat.name.trim()) {
      res.status(400).json({ error: 'Kategori adı zorunludur.' });
      return;
    }
    const id = typeof cat.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(cat.id)
      ? cat.id
      : `cat_${Date.now().toString(36)}`;
    const sanitized = {
      id,
      name: cat.name.trim().slice(0, 80),
      colorKey: ['orange', 'gray', 'blue', 'red', 'green', 'purple', 'teal', 'amber'].includes(cat.colorKey)
        ? cat.colorKey
        : 'blue',
      description: typeof cat.description === 'string' ? cat.description.trim().slice(0, 240) : '',
      coverUrl: typeof cat.coverUrl === 'string' ? cat.coverUrl.trim().slice(0, 500) : '',
      targetValence: typeof cat.targetValence === 'number' ? Math.max(0, Math.min(1, cat.targetValence)) : 0.5,
      targetEnergy: typeof cat.targetEnergy === 'number' ? Math.max(0, Math.min(1, cat.targetEnergy)) : 0.5,
      targetDanceability: typeof cat.targetDanceability === 'number' ? Math.max(0, Math.min(1, cat.targetDanceability)) : 0.5,
      targetAcousticness: typeof cat.targetAcousticness === 'number' ? Math.max(0, Math.min(1, cat.targetAcousticness)) : 0.4,
      targetTempo: typeof cat.targetTempo === 'number' ? Math.max(40, Math.min(230, Math.round(cat.targetTempo))) : 110,
      order: typeof cat.order === 'number' ? cat.order : 10,
      active: cat.active !== false,
      updatedAt: new Date().toISOString(),
    };
    const current = readOverrides();
    current.categories[id] = sanitized;
    writeOverrides(current);
    res.json({ ok: true, category: sanitized });
  });

  // Admin Language CRUD
  app.post('/api/admin/languages', requireAdmin, (req, res) => {
    const lang = req.body;
    if (!lang || typeof lang.code !== 'string' || !/^[a-zA-Z0-9_-]{2,16}$/.test(lang.code)) {
      res.status(400).json({ error: 'Geçerli bir dil kodu (2–16 karakter) zorunludur.' });
      return;
    }
    const sanitized = {
      code: lang.code.trim().toLowerCase(),
      name: typeof lang.name === 'string' && lang.name.trim() ? lang.name.trim().slice(0, 60) : lang.code,
      nativeName: typeof lang.nativeName === 'string' && lang.nativeName.trim() ? lang.nativeName.trim().slice(0, 60) : lang.code,
      active: lang.active !== false,
      order: typeof lang.order === 'number' ? lang.order : 50,
      updatedAt: new Date().toISOString(),
    };
    const current = readOverrides();
    current.languages[sanitized.code] = sanitized;
    writeOverrides(current);
    res.json({ ok: true, language: sanitized });
  });

  return app;
}
