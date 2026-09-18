import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { db, ref, push, update, remove, onValue } from '../firebase';
import { Song } from '../types';
import LocalField, { FIELD_BASE } from '../components/LocalField';
import FieldLabel from '../components/FieldLabel';

interface MusicDraft {
  title: string;
  url: string;
  img: string;
  folder: string;
  newFolder: string;
}

const EMPTY_DRAFT: MusicDraft = { title: '', url: '', img: '', folder: 'new', newFolder: '' };

/* ØµÙØ­Ø© Ù…Ø³ØªÙ‚Ù„Ø©: ØªØ´ØªØ±Ùƒ ÙÙŠ music + defaultSongId Ù…Ù† Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.
   Ù…Ø³ÙˆØ¯Ø© Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ ÙÙŠ ref ÙÙ„Ø§ ØªØ¶ÙŠØ¹ Ø¹Ù†Ø¯ Ø§Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„ØµÙØ­Ø§Øª. */
const MusicPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [defaultSongId, setDefaultSongId] = useState<string>('');
  const [folder, setFolder] = useState<string>(EMPTY_DRAFT.folder);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const draftRef = useRef<MusicDraft>({ ...EMPTY_DRAFT });

  useEffect(() => {
    const unsubSongs = onValue(
      ref(db, 'music'),
      snap => {
        const data: Song[] = [];
        snap.forEach(child => { data.push({ id: child.key!, ...child.val() }); });
        setSongs(data);
        setLoaded(true);
      },
      error => { console.error('Music access denied:', error.message); setLoaded(true); }
    );

    const unsubSettings = onValue(ref(db, 'settings/defaultSongId'), snap => {
      setDefaultSongId(snap.val() || '');
    });

    return () => { unsubSongs(); unsubSettings(); };
  }, []);

  // Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…Ø¬Ù„Ø¯Ø§Øª Ù…Ø´ØªÙ‚Ø© Ù…Ù† Ø§Ù„Ø£ØºØ§Ù†ÙŠ Ù†ÙØ³Ù‡Ø§
  const folderNames = useMemo(() => {
    const set = new Set(songs.map(s => s.folder));
    return Array.from(set);
  }, [songs]);

  const setField = useCallback(<K extends keyof MusicDraft>(key: K) =>
    (value: MusicDraft[K]) => { draftRef.current[key] = value; }, []);

  const handleFolderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    draftRef.current.folder = e.target.value;
    setFolder(e.target.value);
  }, []);

  const addMusic = useCallback(() => {
    const d = draftRef.current;
    const target = d.folder === 'new' ? d.newFolder.trim() : d.folder;
    if (!target || !d.title.trim() || !d.url.trim()) {
      alert('ÙŠØ±Ø¬Ù‰ Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª');
      return;
    }
    setBusy(true);
    push(ref(db, 'music'), {
      name: d.title.trim(),
      url: d.url.trim(),
      image: d.img.trim() || 'https://picsum.photos/400/400',
      folder: target,
    })
      .then(() => {
        draftRef.current = { title: '', url: '', img: '', folder: target, newFolder: '' };
        setFolder(target);
        setResetKey(k => k + 1); // ÙŠÙØ¹ÙŠØ¯ Ø¨Ù†Ø§Ø¡ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ù„ØªÙØ±ÙŠØºÙ‡Ø§
        alert('ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ø¨Ù†Ø¬Ø§Ø­!');
      })
      .catch(err => alert('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª: ' + err.message))
      .finally(() => setBusy(false));
  }, []);

  const setDefault = useCallback((id: string) => {
    update(ref(db, 'settings'), { defaultSongId: id }).catch(e => console.error(e));
  }, []);

  const deleteSong = useCallback((id: string) => {
    if (!confirm('Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø­Ø°ÙØŸ')) return;
    remove(ref(db, `music/${id}`)).catch(e => console.error(e));
  }, []);

  const formKey = `${folder}-${resetKey}`;

  if (!loaded) {
    return <div className="text-white/30 text-xl font-bold text-center py-20">Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø£ØºØ§Ù†ÙŠâ€¦</div>;
  }

  return (
    <div className="max-w-4xl">
      <h3 className="text-3xl font-black mb-10">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙˆØªÙŠ</h3>

      {/* Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø¥Ø¶Ø§ÙØ© */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] mb-12 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FieldLabel>Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ø¬Ù„Ø¯</FieldLabel>
            <select
              value={folder}
              onChange={handleFolderChange}
              className={`${FIELD_BASE} p-4 text-lg font-bold`}
            >
              <option value="new">++ Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø¬Ù„Ø¯ Ø¬Ø¯ÙŠØ¯ ++</option>
              {folderNames.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {folder === 'new' && (
            <div className="space-y-2">
              <FieldLabel>Ø§Ø³Ù… Ø§Ù„Ù…Ø¬Ù„Ø¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯</FieldLabel>
              <LocalField
                key={`nf-${formKey}`}
                initialValue={draftRef.current.newFolder}
                onCommit={setField('newFolder')}
                placeholder="Ø£Ø¯Ø®Ù„ Ø§Ø³Ù…Ø§Ù‹ Ù„Ù„Ù…Ø¬Ù„Ø¯"
                className="p-4 text-lg"
              />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FieldLabel>Ø§Ø³Ù… Ø§Ù„Ø£ØºÙ†ÙŠØ©</FieldLabel>
            <LocalField
              key={`t-${formKey}`}
              initialValue={draftRef.current.title}
              onCommit={setField('title')}
              placeholder="Ù…Ø«Ø§Ù„: Ù„Ø­Ù† Ø§Ù„Ø®Ù„ÙˆØ¯"
              className="p-4 text-lg"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Ø±Ø§Ø¨Ø· Ù…Ù„Ù MP3</FieldLabel>
            <LocalField
              key={`u-${formKey}`}
              initialValue={draftRef.current.url}
              onCommit={setField('url')}
              placeholder="https://..."
              className="p-4 text-lg font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù</FieldLabel>
          <LocalField
            key={`i-${formKey}`}
            initialValue={draftRef.current.img}
            onCommit={setField('img')}
            placeholder="https://..."
            className="p-4 text-lg font-mono"
          />
        </div>

        <button
          onClick={addMusic}
          disabled={busy}
          className="w-full py-5 bg-cyan-600 rounded-[2rem] font-black text-xl shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 active:scale-95 transition-all disabled:opacity-40"
        >
          {busy ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ø¶Ø§ÙØ©...' : 'Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø¢Ù†'}
        </button>
      </div>

      {/* Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£ØºØ§Ù†ÙŠ */}
      <div className="space-y-3">
        {songs.length === 0 && (
          <div className="text-white/10 text-center py-20 text-xl font-bold">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£ØºØ§Ù†ÙŠ Ù…Ø¶Ø§ÙØ© Ø¨Ø¹Ø¯</div>
        )}
        {songs.map(s => (
          <div key={s.id} className="flex items-center gap-6 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-colors">
            <img src={s.image} loading="lazy" decoding="async" alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 truncate">
              <div className="font-black text-lg truncate">{s.name}</div>
              <div className="text-xs text-white/30 font-bold uppercase tracking-widest">{s.folder}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setDefault(s.id)}
                className={`w-12 h-12 rounded-full transition-colors flex items-center justify-center ${defaultSongId === s.id ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white/20 hover:text-white/60'}`}
                title="ØªØ¹ÙŠÙŠÙ† ÙƒØ£ØºÙ†ÙŠØ© Ø§ÙØªØ±Ø§Ø¶ÙŠØ©"
              >
                <Heart size={20} fill={defaultSongId === s.id ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => deleteSong(s.id)}
                className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(MusicPage);
