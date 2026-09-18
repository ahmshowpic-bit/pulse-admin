import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { db, ref, set, remove, onValue } from '../firebase';
import { CustomPage } from '../types';
import LocalField from '../components/LocalField';
import FieldLabel from '../components/FieldLabel';

interface PageDraft { id: string; title: string; content: string }

const EMPTY_DRAFT: PageDraft = { id: '', title: '', content: '' };

const PagesPage: React.FC = () => {
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const draftRef = useRef<PageDraft>({ ...EMPTY_DRAFT });

  useEffect(() => {
    const unsub = onValue(
      ref(db, 'custom_pages'),
      snap => {
        const data: CustomPage[] = [];
        snap.forEach(child => { data.push({ id: child.key!, ...child.val() }); });
        setCustomPages(data);
        setLoaded(true);
      },
      error => { console.error('Pages access denied:', error.message); setLoaded(true); }
    );
    return () => unsub();
  }, []);

  const setField = useCallback(<K extends keyof PageDraft>(key: K) =>
    (value: PageDraft[K]) => { draftRef.current[key] = value; }, []);

  const publish = useCallback(() => {
    const { id, title, content } = draftRef.current;
    if (!id.trim() || !title.trim()) {
      alert('ÙŠØ±Ø¬Ù‰ Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©');
      return;
    }
    setBusy(true);
    set(ref(db, `custom_pages/${id.trim()}`), { title: title.trim(), content, icon: 'MoreHorizontal' })
      .then(() => {
        draftRef.current = { ...EMPTY_DRAFT };
        setResetKey(k => k + 1);
        alert('ØªÙ… Ù†Ø´Ø± Ø§Ù„ØµÙØ­Ø© Ø¨Ù†Ø¬Ø§Ø­!');
      })
      .catch(e => alert('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª: ' + e.message))
      .finally(() => setBusy(false));
  }, []);

  const deletePage = useCallback((id: string) => {
    if (!confirm('Ø­Ø°Ù Ø§Ù„ØµÙØ­Ø©ØŸ')) return;
    remove(ref(db, `custom_pages/${id}`)).catch(e => console.error(e));
  }, []);

  if (!loaded) {
    return <div className="text-white/30 text-xl font-bold text-center py-20">Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø§Øªâ€¦</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <h3 className="text-3xl font-black">Ù…Ù†Ø´Ø¦ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠ</h3>

      <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FieldLabel>Ù…ÙØ¹Ø±Ù Ø§Ù„ØµÙØ­Ø© (English ID)</FieldLabel>
            <LocalField
              key={`pid-${resetKey}`}
              initialValue={draftRef.current.id}
              onCommit={setField('id')}
              placeholder="Ù…Ø«Ø§Ù„: about_us"
              className="p-5 font-bold"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© (Arabic)</FieldLabel>
            <LocalField
              key={`ptitle-${resetKey}`}
              initialValue={draftRef.current.title}
              onCommit={setField('title')}
              placeholder="Ù…Ø«Ø§Ù„: Ù…Ù† Ù†Ø­Ù†"
              className="p-5 font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø© (HTML / Text)</FieldLabel>
          <LocalField
            key={`pcontent-${resetKey}`}
            initialValue={draftRef.current.content}
            onCommit={setField('content')}
            placeholder="Ø§ÙƒØªØ¨ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø© Ù‡Ù†Ø§ Ø¨ØµÙŠØºØ© HTML..."
            rows={12}
            debounceMs={0}
            className="p-6 rounded-[2rem] text-lg font-mono leading-relaxed"
          />
        </div>

        <button
          onClick={publish}
          disabled={busy}
          className="w-full py-6 bg-purple-600 rounded-full font-black text-xl shadow-lg shadow-purple-600/20 hover:bg-purple-500 transition-colors disabled:opacity-40"
        >
          {busy ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ù†Ø´Ø±...' : 'Ù†Ø´Ø± Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©'}
        </button>
      </div>

      <div className="grid gap-4">
        <h4 className="text-xl font-black text-white/40 mt-8 mb-4">Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„Ø­Ø§Ù„ÙŠØ©</h4>
        {customPages.length === 0 && (
          <div className="text-white/10 text-center py-10 text-lg font-bold">Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙØ­Ø§Øª Ù…Ø®ØµØµØ© Ø¨Ø¹Ø¯</div>
        )}
        {customPages.map(pg => (
          <div key={pg.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="font-black text-lg">
              {pg.title} <span className="text-xs text-white/20 ml-2">({pg.id})</span>
            </div>
            <button
              onClick={() => deletePage(pg.id)}
              className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PagesPage);
