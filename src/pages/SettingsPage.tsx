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

/* صفحة مستقلة: تشترك في settings من Firebase وتحفظ مباشرة.
   المسودة في ref — الكتابة لا تعيد تصيير الصفحة. */
const SettingsPage: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, forceRender] = useState(0);

  const draftRef = useRef<AppSettings>({ ...DEFAULT_SETTINGS });
  const visitorCountRef = useRef(0);
  const loadedRef = useRef(false);

  // جلب الإعدادات + مزامنة المسودة عند أول تحميل فقط
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
    // العدّاد يأتي من السنابشوت ولا يُكتب من المسودة
    const payload = { ...draftRef.current, visitorCount: visitorCountRef.current };
    set(ref(db, 'settings'), payload)
      .then(() => alert('تم تحديث كافة الإعدادات بنجاح'))
      .catch((e: any) => alert('فشل الحفظ: ' + e.message))
      .finally(() => setSaving(false));
  }, []);

  const d = draftRef.current;

  if (!ready) {
    return <div className="text-white/30 text-xl font-bold text-center py-20">جارِ تحميل الإعدادات…</div>;
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <h3 className="text-3xl font-black">إعدادات النظام الأساسية</h3>

      <div className="space-y-8 bg-white/5 p-10 rounded-[3rem] border border-white/10">
        <div className="space-y-3">
          <FieldLabel accent>نص الترحيب الرئيسي</FieldLabel>
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
              <div className="font-black text-lg">عداد الزيارات</div>
              <div className="text-xs text-white/30">إظهار عدد زوار الموقع للعامة</div>
            </div>
          </div>
          <Toggle checked={!!d.showVisitorCount} onChange={v => setControlled('showVisitorCount', v)} />
        </div>

        <div className="p-10 bg-purple-500/5 rounded-[3rem] border border-purple-500/20 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap size={100} /></div>
          <h4 className="text-2xl font-black text-purple-400 flex items-center gap-3">
            <Sparkles size={24} /> محرك العرض (Hero Engine)
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-lg">وضع Hero الثابت</div>
              <div className="text-xs text-white/30">تجاهل خلفيات الأغاني واستخدام خلفية ثابتة</div>
            </div>
            <Toggle color="purple" checked={!!d.heroMode} onChange={v => setControlled('heroMode', v)} />
          </div>

          <div className="space-y-3">
            <FieldLabel>رابط الوسائط (صورة/فيديو)</FieldLabel>
            <LocalField
              initialValue={d.heroImg || ''}
              onCommit={setText('heroImg')}
              placeholder="ضع الرابط هنا"
              className="p-5 text-lg font-mono"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel>نوع الوسائط</FieldLabel>
              <select
                value={d.heroType}
                onChange={e => setControlled('heroType', e.target.value)}
                className={`${FIELD_BASE} p-4 font-bold`}
              >
                <option value="image">صورة احترافية</option>
                <option value="video">فيديو تفاعلي</option>
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel>نمط الملاءمة</FieldLabel>
              <select
                value={d.bgFit}
                onChange={e => setControlled('bgFit', e.target.value)}
                className={`${FIELD_BASE} p-4 font-bold`}
              >
                <option value="cover">ملء كامل (Cover)</option>
                <option value="contain">احتواء ذكي (Contain)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-6 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-[2rem] font-black text-2xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all disabled:opacity-40"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>
    </div>
  );
};

export default React.memo(SettingsPage);
