import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Sparkles, Zap } from 'lucide-react';
import { db, ref, set, onValue } from '../firebase';
import { AppSettings } from '../types';
import LocalField, { FIELD_BASE } from '../components/LocalField';
import FieldLabel from '../components/FieldLabel';
import Toggle from '../components/Toggle';

const DEFAULT_SETTINGS: AppSettings = {
  welcome: '',
  showVisitorCount: false,
  heroMode: false,
  heroImg: '',
  heroType: 'image',
  bgFit: 'cover',
  visitorCount: 0,
  defaultSongId: '',
};

/* ØµÙØ­Ø© Ù…Ø³ØªÙ‚Ù„Ø©: ØªØ´ØªØ±Ùƒ ÙÙŠ settings Ù…Ù† Firebase ÙˆØªØ­ÙØ¸ Ù…Ø¨Ø§Ø´Ø±Ø©.
   Ø§Ù„Ù…Ø³ÙˆØ¯Ø© ÙÙŠ ref â€” Ø§Ù„ÙƒØªØ§Ø¨Ø© Ù„Ø§ ØªØ¹ÙŠØ¯ ØªØµÙŠÙŠØ± Ø§Ù„ØµÙØ­Ø©. */
const SettingsPage: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, forceRender] = useState(0);

  const draftRef = useRef<AppSettings>({ ...DEFAULT_SETTINGS });
  const visitorCountRef = useRef(0);
  const loadedRef = useRef(false);

  // Ø¬Ù„Ø¨ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª + Ù…Ø²Ø§Ù…Ù†Ø© Ø§Ù„Ù…Ø³ÙˆØ¯Ø© Ø¹Ù†Ø¯ Ø£ÙˆÙ„ ØªØ­Ù…ÙŠÙ„ ÙÙ‚Ø·
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'settings'),
      snap => {
        const data = snap.val() || {};
        const next = { ...DEFAULT_SETTINGS, ...data } as AppSettings;
        visitorCountRef.current = next.visitorCount ?? 0;
        if (!loadedRef.current) {
          draftRef.current = { ...next };
          loadedRef.current = true;
          forceRender(n => n + 1);
        }
        setReady(true);
      },
      error => {
        console.error('Settings access denied:', error.message);
        setReady(true);
      }
    );
    return () => unsub();
  }, []);

  const setText = useCallback(<K extends keyof AppSettings>(key: K) =>
    (value: string) => { (draftRef.current as any)[key] = value; }, []);

  const setControlled = useCallback((key: keyof AppSettings, value: any) => {
    (draftRef.current as any)[key] = value;
    forceRender(n => n + 1);
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    // Ø§Ù„Ø¹Ø¯Ù‘Ø§Ø¯ ÙŠØ£ØªÙŠ Ù…Ù† Ø§Ù„Ø³Ù†Ø§Ø¨Ø´ÙˆØª ÙˆÙ„Ø§ ÙŠÙÙƒØªØ¨ Ù…Ù† Ø§Ù„Ù…Ø³ÙˆØ¯Ø©
    const payload = { ...draftRef.current, visitorCount: visitorCountRef.current };
    set(ref(db, 'settings'), payload)
      .then(() => alert('ØªÙ… ØªØ­Ø¯ÙŠØ« ÙƒØ§ÙØ© Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø¨Ù†Ø¬Ø§Ø­'))
      .catch((e: any) => alert('ÙØ´Ù„ Ø§Ù„Ø­ÙØ¸: ' + e.message))
      .finally(() => setSaving(false));
  }, []);

  const d = draftRef.current;

  if (!ready) {
    return <div className="text-white/30 text-xl font-bold text-center py-20">Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øªâ€¦</div>;
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <h3 className="text-3xl font-black">Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©</h3>

      <div className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
        <div className="space-y-3">
          <FieldLabel accent>Ù†Øµ Ø§Ù„ØªØ±Ø­ÙŠØ¨ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ</FieldLabel>
          <LocalField
            initialValue={d.welcome || ''}
            onCommit={setText('welcome')}
            className="p-5 text-xl font-black text-center"
          />
        </div>

        <div className="flex items-center justify-between p-6 bg-cyan-500/5 rounded-[2rem] border border-cyan-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Users size={24} />
            </div>
            <div>
              <div className="font-black text-lg">Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø²ÙŠØ§Ø±Ø§Øª</div>
              <div className="text-xs text-white/30">Ø¥Ø¸Ù‡Ø§Ø± Ø¹Ø¯Ø¯ Ø²ÙˆØ§Ø± Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù„Ù„Ø¹Ø§Ù…Ø©</div>
            </div>
          </div>
          <Toggle checked={!!d.showVisitorCount} onChange={v => setControlled('showVisitorCount', v)} />
        </div>

        <div className="p-10 bg-purple-500/5 rounded-[3rem] border border-purple-500/20 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap size={100} /></div>
          <h4 className="text-2xl font-black text-purple-400 flex items-center gap-3">
            <Sparkles size={24} /> Ù…Ø­Ø±Ùƒ Ø§Ù„Ø¹Ø±Ø¶ (Hero Engine)
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-lg">ÙˆØ¶Ø¹ Hero Ø§Ù„Ø«Ø§Ø¨Øª</div>
              <div className="text-xs text-white/30">ØªØ¬Ø§Ù‡Ù„ Ø®Ù„ÙÙŠØ§Øª Ø§Ù„Ø£ØºØ§Ù†ÙŠ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù… Ø®Ù„ÙÙŠØ© Ø«Ø§Ø¨ØªØ©</div>
            </div>
            <Toggle color="purple" checked={!!d.heroMode} onChange={v => setControlled('heroMode', v)} />
          </div>

          <div className="space-y-3">
            <FieldLabel>Ø±Ø§Ø¨Ø· Ø§Ù„ÙˆØ³Ø§Ø¦Ø· (ØµÙˆØ±Ø©/ÙÙŠØ¯ÙŠÙˆ)</FieldLabel>
            <LocalField
              initialValue={d.heroImg || ''}
              onCommit={setText('heroImg')}
              placeholder="Ø¶Ø¹ Ø§Ù„Ø±Ø§Ø¨Ø· Ù‡Ù†Ø§"
              className="p-5 text-lg font-mono"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel>Ù†ÙˆØ¹ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·</FieldLabel>
              <select
                value={d.heroType}
                onChange={e => setControlled('heroType', e.target.value)}
                className={`${FIELD_BASE} p-4 font-bold`}
              >
                <option value="image">ØµÙˆØ±Ø© Ø§Ø­ØªØ±Ø§ÙÙŠØ©</option>
                <option value="video">ÙÙŠØ¯ÙŠÙˆ ØªÙØ§Ø¹Ù„ÙŠ</option>
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel>Ù†Ù…Ø· Ø§Ù„Ù…Ù„Ø§Ø¡Ù…Ø©</FieldLabel>
              <select
                value={d.bgFit}
                onChange={e => setControlled('bgFit', e.target.value)}
                className={`${FIELD_BASE} p-4 font-bold`}
              >
                <option value="cover">Ù…Ù„Ø¡ ÙƒØ§Ù…Ù„ (Cover)</option>
                <option value="contain">Ø§Ø­ØªÙˆØ§Ø¡ Ø°ÙƒÙŠ (Contain)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-6 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-[2rem] font-black text-2xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all disabled:opacity-40"
        >
          {saving ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸...' : 'Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(SettingsPage);
