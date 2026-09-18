import React, { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { db, ref, remove, onValue } from '../firebase';
import { ContactMessage } from '../types';

const InboxPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onValue(
      ref(db, 'inbox'),
      snap => {
        const data: ContactMessage[] = [];
        snap.forEach(child => { data.push({ id: child.key!, ...child.val() }); });
        setMessages(data);
        setLoaded(true);
      },
      error => { console.warn('Inbox access restricted:', error.message); setLoaded(true); }
    );
    return () => unsub();
  }, []);

  const handleDelete = useCallback((id: string) => {
    remove(ref(db, `inbox/${id}`)).catch(e => console.error(e));
  }, []);

  if (!loaded) {
    return <div className="text-white/30 text-xl font-bold text-center py-20">Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„â€¦</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="text-3xl font-black mb-10 flex items-center justify-between">
        ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„ÙˆØ§Ø±Ø¯
        <span className="bg-cyan-500/20 text-cyan-400 px-4 py-1 rounded-full text-sm font-black">
          {messages.length} Ø±Ø³Ø§Ù„Ø©
        </span>
      </h3>

      {messages.length === 0 && (
        <div className="text-white/10 text-center py-20 text-xl font-bold">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø±Ø³Ø§Ø¦Ù„ Ø¬Ø¯ÙŠØ¯Ø© Ø­Ø§Ù„ÙŠØ§Ù‹</div>
      )}

      {messages.map(m => (
        <div
          key={m.id}
          className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-start gap-6 hover:bg-white/10 transition-colors group"
        >
          <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-cyan-600/20 flex items-center justify-center text-cyan-400 font-black text-2xl uppercase">
            {m.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-xl text-white mb-2 flex items-center gap-3">
              {m.name}
              {m.visitorId && (
                <span className="text-[10px] font-mono text-white/20 font-normal">#{m.visitorId}</span>
              )}
            </div>
            <div className="text-lg text-white/60 leading-relaxed bg-[#08080d] p-4 rounded-2xl break-words">
              {m.msg}
            </div>
          </div>
          <button
            onClick={() => handleDelete(m.id)}
            className="text-red-500/30 hover:text-red-500 p-3 rounded-full hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          >
            <Trash2 size={24} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(InboxPage);
