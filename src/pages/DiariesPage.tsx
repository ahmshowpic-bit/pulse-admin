import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Heart, Trash2, MessageCircle, ChevronDown, ChevronUp,
  ShieldCheck, UserRound, Send, CheckCircle, Users,
} from 'lucide-react';
import {
  db, ref, set, push, remove, runTransaction, onValue,
  query, limitToLast, orderByKey,
} from '../firebase';
import { FIELD_BASE } from '../components/LocalField';
import FieldLabel from '../components/FieldLabel';

/* ==========================================================================
   صفحة إدارة اليوميات (المجتمع)
   نفس هيكل البيانات المستخدم في الموقع الأصلي بالظبط:
   diaries/{id} = { name, text, verified, date, likes, visitorId, likedBy, comments }
   ========================================================================== */

interface DiaryComment {
  name: string;
  text: string;
  verified: boolean;
  date: string;
  visitorId?: string;
}

interface DiaryEntry {
  id: string;
  name: string;
  text: string;
  verified: boolean;
  date: string;
  likes: number;
  visitorId?: string;
  comments?: Record<string, DiaryComment>;
  likedBy?: Record<string, boolean>;
}

const ADMIN_NAME = 'AHMED PULSE';
const ADMIN_VISITOR_ID = 'ADMIN';
const MAX_NAME = 20;
const MAX_POST_LENGTH = 1000;    // نفس حد قواعد Firebase لنص اليومية
const MAX_COMMENT_LENGTH = 500;  // نفس حد قواعد Firebase لنص التعليق
const PAGE_STEP = 30;

const today = () => new Date().toLocaleDateString('ar-EG');

const resolveIdentity = (asAdmin: boolean, name: string) =>
  asAdmin
    ? { name: ADMIN_NAME, verified: true }
    : { name: name.trim() || 'مجهول', verified: false };

/* -------------------------------------------------------------------------- */
/* اختيار الهوية: مسؤول موثّق أو زائر باسم تكتبه                               */
/* -------------------------------------------------------------------------- */
interface IdentityPickerProps {
  asAdmin: boolean;
  onAsAdminChange: (v: boolean) => void;
  name: string;
  onNameChange: (v: string) => void;
}

const IdentityPicker: React.FC<IdentityPickerProps> = React.memo(
  ({ asAdmin, onAsAdminChange, name, onNameChange }) => (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-[#08080d] border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => onAsAdminChange(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-colors ${
            asAdmin ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <ShieldCheck size={16} /> كمسؤول (موثّق)
        </button>
        <button
          type="button"
          onClick={() => onAsAdminChange(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-colors ${
            !asAdmin ? 'bg-white text-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <UserRound size={16} /> كزائر
        </button>
      </div>
      {!asAdmin && (
        <input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          maxLength={MAX_NAME}
          placeholder="اسم الزائر"
          aria-label="اسم الزائر"
          className={`${FIELD_BASE} p-4 font-bold text-sm`}
        />
      )}
    </div>
  )
);
IdentityPicker.displayName = 'IdentityPicker';

/* -------------------------------------------------------------------------- */
/* شارة التوثيق                                                               */
/* -------------------------------------------------------------------------- */
const VerifiedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30 font-black">
    <CheckCircle size={10} /> Verified Agent
  </span>
);

/* -------------------------------------------------------------------------- */
/* نشر يومية جديدة (حالته معزولة عن القائمة فالكتابة لا تعيد رسم اليوميات)     */
/* -------------------------------------------------------------------------- */
const Composer: React.FC = React.memo(() => {
  const [asAdmin, setAsAdmin] = useState(true);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const publish = useCallback(() => {
    if (!text.trim() || busy) return;
    const identity = resolveIdentity(asAdmin, name);
    setBusy(true);
    set(push(ref(db, 'diaries')), {
      name: identity.name,
      text: text.trim(),
      verified: identity.verified,
      date: today(),
      likes: 0,
      visitorId: ADMIN_VISITOR_ID,
    })
      .then(() => setText(''))
      .catch((e: any) => alert('فشل النشر: ' + e.message))
      .finally(() => setBusy(false));
  }, [text, busy, asAdmin, name]);

  return (
    <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-5">
      <FieldLabel accent>نشر يومية جديدة</FieldLabel>
      <IdentityPicker
        asAdmin={asAdmin}
        onAsAdminChange={setAsAdmin}
        name={name}
        onNameChange={setName}
      />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        maxLength={MAX_POST_LENGTH}
        placeholder="اكتب اليومية هنا..."
        aria-label="نص اليومية"
        className={`${FIELD_BASE} p-5 text-lg leading-relaxed resize-none`}
      />
      <button
        onClick={publish}
        disabled={busy || !text.trim()}
        className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full font-black text-lg shadow-lg shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40"
      >
        {busy ? 'جاري النشر...' : 'نشر الآن'} <Send size={18} />
      </button>
    </div>
  );
});
Composer.displayName = 'Composer';

/* -------------------------------------------------------------------------- */
/* التعليقات على يومية واحدة: إضافة كمسؤول/زائر + حذف تعليق                   */
/* -------------------------------------------------------------------------- */
interface CommentsBoxProps {
  postId: string;
  comments?: Record<string, DiaryComment>;
}

const CommentsBox: React.FC<CommentsBoxProps> = React.memo(({ postId, comments }) => {
  const [asAdmin, setAsAdmin] = useState(true);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    if (!comments) return [];
    return Object.entries(comments)
      .map(([id, c]) => ({ id, ...c }))
      .sort((a, b) => (a.id > b.id ? 1 : -1));
  }, [comments]);

  const send = useCallback(() => {
    if (!text.trim() || busy) return;
    const identity = resolveIdentity(asAdmin, name);
    setBusy(true);
    set(push(ref(db, `diaries/${postId}/comments`)), {
      name: identity.name,
      text: text.trim(),
      verified: identity.verified,
      date: today(),
      visitorId: ADMIN_VISITOR_ID,
    })
      .then(() => setText(''))
      .catch((e: any) => alert('فشل إرسال التعليق: ' + e.message))
      .finally(() => setBusy(false));
  }, [text, busy, asAdmin, name, postId]);

  const removeComment = useCallback((commentId: string) => {
    if (!confirm('حذف هذا التعليق؟')) return;
    remove(ref(db, `diaries/${postId}/comments/${commentId}`)).catch((e: any) =>
      alert('فشل الحذف: ' + e.message)
    );
  }, [postId]);

  return (
    <div className="px-6 pb-6 space-y-5">
      <IdentityPicker
        asAdmin={asAdmin}
        onAsAdminChange={setAsAdmin}
        name={name}
        onNameChange={setName}
      />

      <div className="flex gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="اكتب تعليقًا..."
          aria-label="نص التعليق"
          className={`${FIELD_BASE} flex-1 p-4 text-sm`}
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !text.trim()}
          aria-label="إرسال التعليق"
          className="px-5 rounded-2xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-cyan-500/20 disabled:hover:text-cyan-400"
        >
          <Send size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {list.length === 0 && (
          <div className="text-white/20 text-sm text-center py-3">لا توجد تعليقات بعد</div>
        )}
        {list.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-sm text-white">
              {(c.name || '?')[0]}
            </div>
            <div className="flex-1 min-w-0 bg-white/5 rounded-2xl px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-black text-sm">{c.name}</span>
                {c.verified && <VerifiedBadge />}
                <span className="text-[10px] text-white/20">{c.date}</span>
              </div>
              <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {c.text}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeComment(c.id)}
              aria-label="حذف التعليق"
              className="self-start w-9 h-9 shrink-0 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
CommentsBox.displayName = 'CommentsBox';

/* -------------------------------------------------------------------------- */
/* بطاقة يومية: لايكات بلا حدود + حذف + تعليقات                               */
/* -------------------------------------------------------------------------- */
const DiaryCard: React.FC<{ post: DiaryEntry }> = React.memo(({ post }) => {
  const [open, setOpen] = useState(false);
  const commentsCount = post.comments ? Object.keys(post.comments).length : 0;

  const addLikes = useCallback((delta: number) => {
    runTransaction(
      ref(db, `diaries/${post.id}/likes`),
      (likes: number | null) => Math.max(0, (likes || 0) + delta)
    ).catch((e: any) => console.error('Like failed:', e));
  }, [post.id]);

  const removePost = useCallback(() => {
    if (!confirm('حذف هذه اليومية نهائيًا مع كل تعليقاتها؟')) return;
    remove(ref(db, `diaries/${post.id}`)).catch((e: any) => alert('فشل الحذف: ' + e.message));
  }, [post.id]);

  return (
    <div
      className={`rounded-[2rem] border overflow-hidden ${
        post.verified ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-center gap-4 p-5 bg-black/20">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-lg text-white">
          {(post.name || '?')[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg flex flex-wrap items-center gap-2">
            <span className="truncate">{post.name}</span>
            {post.verified && <VerifiedBadge />}
          </div>
          <div className="text-xs text-white/30">{post.date}</div>
        </div>
        <button
          onClick={removePost}
          aria-label="حذف اليومية"
          className="w-10 h-10 shrink-0 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-6 text-white/80 text-lg leading-relaxed whitespace-pre-wrap break-words">
        {post.text}
      </div>

      <div className="px-6 py-4 border-t border-white/5 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 font-black text-red-400 bg-red-500/10 px-4 py-2 rounded-full">
          <Heart size={18} fill="currentColor" /> {post.likes || 0}
        </span>
        <button
          onClick={() => addLikes(1)}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-red-500 hover:text-white text-white/70 font-black text-sm transition-colors active:scale-95"
        >
          +1
        </button>
        <button
          onClick={() => addLikes(10)}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-red-500 hover:text-white text-white/70 font-black text-sm transition-colors active:scale-95"
        >
          +10
        </button>
        <button
          onClick={() => addLikes(-1)}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/20 text-white/40 font-black text-sm transition-colors active:scale-95"
        >
          −1
        </button>
      </div>

      <div className="border-t border-white/5">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-white/50 hover:text-white transition-colors font-bold text-sm"
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={16} /> التعليقات ({commentsCount})
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {open && <CommentsBox postId={post.id} comments={post.comments} />}
      </div>
    </div>
  );
});
DiaryCard.displayName = 'DiaryCard';

/* -------------------------------------------------------------------------- */
/* الصفحة                                                                     */
/* -------------------------------------------------------------------------- */
const DiariesPage: React.FC = () => {
  const [posts, setPosts] = useState<DiaryEntry[]>([]);
  const [limit, setLimit] = useState(PAGE_STEP);
  const [loaded, setLoaded] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  // اليوميات: أحدث N يومية، والزيادة بتتحمّل عند الطلب (توفير بيانات)
  useEffect(() => {
    const unsub = onValue(
      query(ref(db, 'diaries'), orderByKey(), limitToLast(limit)),
      snap => {
        const data: DiaryEntry[] = [];
        snap.forEach(child => { data.push({ id: child.key!, ...child.val() }); });
        setPosts(data.reverse());
        setLoaded(true);
      },
      error => {
        console.error('Diaries access denied:', error.message);
        setLoaded(true);
      }
    );
    return () => unsub();
  }, [limit]);

  // عدّاد الزوار (كان ظاهر للأدمن دايمًا في الموقع الأصلي)
  useEffect(() => {
    const unsub = onValue(
      ref(db, 'settings/visitorCount'),
      snap => setVisitorCount(typeof snap.val() === 'number' ? snap.val() : 0),
      () => setVisitorCount(null)
    );
    return () => unsub();
  }, []);

  const loadMore = useCallback(() => setLimit(l => l + PAGE_STEP), []);

  if (!loaded) {
    return <div className="text-white/30 text-xl font-bold text-center py-20">جارِ تحميل اليوميات…</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <h3 className="text-3xl font-black flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <Users className="text-cyan-400" size={32} /> إدارة اليوميات
        </span>
        <span className="flex items-center gap-2">
          {visitorCount !== null && (
            <span className="bg-purple-500/20 text-purple-300 px-4 py-1 rounded-full text-sm font-black">
              {visitorCount} زيارة
            </span>
          )}
          <span className="bg-cyan-500/20 text-cyan-400 px-4 py-1 rounded-full text-sm font-black">
            {posts.length} يومية
          </span>
        </span>
      </h3>

      <Composer />

      <div className="grid gap-6">
        {posts.length === 0 && (
          <div className="text-white/10 text-center py-16 text-xl font-bold">لا توجد يوميات بعد</div>
        )}
        {posts.map(post => (
          <DiaryCard key={post.id} post={post} />
        ))}
        {posts.length >= limit && (
          <button
            onClick={loadMore}
            className="w-full py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white/60 font-black hover:bg-white/10 hover:text-white transition-colors"
          >
            تحميل يوميات أقدم
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(DiariesPage);
