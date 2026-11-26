import React from 'react';
import { FolderHeart, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CuratedPlaylist, MoodCategory, UserPlaylist } from '../types/music';
import { PlaylistCover } from './PlaylistCover';

interface MyPlaylistsViewProps {
  userPlaylists: UserPlaylist[];
  categories: MoodCategory[];
  onCreateNew: () => void;
  onOpenPlaylist: (playlistId: string) => void;
  onEditPlaylist: (playlist: UserPlaylist) => void;
  onDeletePlaylist: (playlistId: string) => void;
  curatedPlaylists: CuratedPlaylist[];
  getPlaylistTrackCount: (pl: CuratedPlaylist) => number;
}

export const MyPlaylistsView: React.FC<MyPlaylistsViewProps> = ({
  userPlaylists,
  categories,
  onCreateNew,
  onOpenPlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  curatedPlaylists,
  getPlaylistTrackCount,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#30282D] dark:text-[#FAF4F6]">
            Çalma Listelerim
          </h1>
          <p className="text-sm text-[#5B4D54] dark:text-[#DFD1D7]">
            Kendi oluşturduğun ve kaydettiğin çalma listelerini yönet.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs sm:text-sm font-bold transition-all self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Çalma Listesi Oluştur</span>
        </button>
      </div>

      {/* User Playlists */}
      {userPlaylists.length === 0 ? (
        <div className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-8 text-center space-y-3">
          <FolderHeart className="w-10 h-10 mx-auto text-[#B97891]" />
          <h2 className="text-base font-bold text-[#30282D] dark:text-[#FAF4F6]">Henüz kişisel çalma listen yok</h2>
          <p className="text-xs sm:text-sm text-[#5B4D54] dark:text-[#B9A7B0] max-w-md mx-auto">
            Yeni bir çalma listesi oluşturabilir veya ruh hâli kategorilerinden sana özel önerilen listeleri
            kaydedebilirsin.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B97891] to-[#D8A1B3] hover:from-[#A6657E] hover:to-[#C88EA1] text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Listemi Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPlaylists.map((pl) => {
            const cat = categories.find((c) => c.id === pl.moodId);
            return (
              <div
                key={pl.id}
                className="bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-[#D8A1B3] dark:hover:border-[#B97891] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpenPlaylist(pl.id)}
                  className="text-left group cursor-pointer"
                >
                  <PlaylistCover
                    title={pl.name}
                    subtitle={cat?.name}
                    coverUrl={pl.coverUrl}
                    colorKey={cat?.colorKey || 'rose'}
                    seed={pl.id}
                    className="w-full aspect-[16/10] mb-3"
                  />
                  <div className="text-xs text-[#7D6C74] dark:text-[#B9A7B0]">
                    <span>{cat?.name || 'Kişisel Liste'}</span>
                    <span> · </span>
                    <span className="font-mono tabular-nums">{pl.trackIds.length} şarkı</span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-[#30282D] dark:text-[#FAF4F6] group-hover:text-[#9F5C76] dark:group-hover:text-[#E5B8C7] truncate">
                    {pl.name}
                  </h3>
                  {pl.description && (
                    <p className="mt-1 text-xs text-[#5B4D54] dark:text-[#CFC0C7] line-clamp-1">{pl.description}</p>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#F2E9EC] dark:border-[#362A31]">
                  <button
                    type="button"
                    onClick={() => onOpenPlaylist(pl.id)}
                    className="text-xs font-bold text-[#9F5C76] dark:text-[#E5B8C7] hover:underline cursor-pointer"
                  >
                    Listeyi Aç
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditPlaylist(pl)}
                      aria-label="Listeyi düzenle"
                      className="p-2 rounded-lg text-[#7D6C74] hover:bg-[#F5ECEF] dark:hover:bg-[#2B2227] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePlaylist(pl.id)}
                      aria-label="Listeyi sil"
                      className="p-2 rounded-lg text-[#7D6C74] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Curated Collections Reference */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#30282D] dark:text-[#FAF4F6]">
          Editör Çalma Listeleri
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {curatedPlaylists.slice(0, 4).map((pl) => {
            const cat = categories.find((c) => c.id === pl.moodId);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => onOpenPlaylist(pl.id)}
                className="text-left bg-[#FFFDFC] dark:bg-[#211A1E] border border-[#EDE2E5] dark:border-[#362A31] rounded-2xl p-3 hover:border-[#D8A1B3] dark:hover:border-[#B97891] transition-colors cursor-pointer"
              >
                <PlaylistCover
                  title={pl.title}
                  subtitle={cat?.name}
                  coverUrl={pl.coverUrl}
                  colorKey={cat?.colorKey || 'rose'}
                  seed={pl.id}
                  className="w-full aspect-[16/10] mb-2.5"
                />
                <div className="text-xs text-[#7D6C74] dark:text-[#B9A7B0] font-mono tabular-nums">
                  {getPlaylistTrackCount(pl)} şarkı
                </div>
                <div className="text-sm font-bold text-[#30282D] dark:text-[#FAF4F6] truncate">{pl.title}</div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
