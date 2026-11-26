export interface ArtworkResult {
  coverUrl: string | null;
  releaseType: 'single' | 'album' | null;
}

const clientCoverCache = new Map<string, ArtworkResult>();
const inflightRequests = new Map<string, Promise<ArtworkResult>>();

export async function fetchTrackArtwork(
  title: string,
  artist: string,
  album?: string
): Promise<ArtworkResult> {
  const key = `${title.toLowerCase()}::${artist.toLowerCase()}::${(album || '').toLowerCase()}`;
  const cached = clientCoverCache.get(key);
  if (cached) return cached;

  const existing = inflightRequests.get(key);
  if (existing) return existing;

  const params = new URLSearchParams({ title, artist });
  if (album) params.set('album', album);

  const req = fetch(`/api/artwork?${params.toString()}`)
    .then(async (r) => {
      if (!r.ok) return { coverUrl: null, releaseType: null };
      const data = await r.json();
      const result: ArtworkResult = {
        coverUrl: typeof data?.coverUrl === 'string' ? data.coverUrl : null,
        releaseType:
          data?.releaseType === 'single' || data?.releaseType === 'album' ? data.releaseType : null,
      };
      clientCoverCache.set(key, result);
      return result;
    })
    .catch(() => ({ coverUrl: null, releaseType: null }))
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, req);
  return req;
}
