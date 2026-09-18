import React, { useState, useRef, useEffect, useCallback } from 'react';

/* نمط مشترك: حقل معتم تماماً (بدون backdrop-blur) */
export const FIELD_BASE =
  'w-full bg-[#08080d] border border-white/10 rounded-2xl outline-none focus:border-cyan-500/60 transition-colors';

interface LocalFieldProps {
  initialValue: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  debounceMs?: number;
  ariaLabel?: string;
}

/* حقل نصي معزول: state محلي + commit عند onBlur أو بعد debounce.
   الكتابة لا تسبب أي re-render خارج هذا الحقل. */
const LocalField: React.FC<LocalFieldProps> = React.memo(({
  initialValue, onCommit, placeholder, className = '', rows, debounceMs = 500, ariaLabel
}) => {
  const [value, setValue] = useState(initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(initialValue);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  // لو الأب غيّر القيمة من الخارج (تحميل إعدادات جديدة مثلاً)
  useEffect(() => {
    if (initialValue !== latest.current) {
      latest.current = initialValue;
      setValue(initialValue);
    }
  }, [initialValue]);

  const clearTimer = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  }, []);

  const commit = useCallback((v: string) => {
    clearTimer();
    if (v === latest.current) return;
    latest.current = v;
    commitRef.current(v);
  }, [clearTimer]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setValue(v);
      clearTimer();
      if (debounceMs > 0) timer.current = setTimeout(() => commit(v), debounceMs);
    },
    [commit, debounceMs, clearTimer]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => commit(e.target.value),
    [commit]
  );

  useEffect(() => clearTimer, [clearTimer]);

  const shared = {
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    'aria-label': ariaLabel || placeholder,
    className: `${FIELD_BASE} ${className}`,
  };

  return rows ? <textarea {...shared} rows={rows} /> : <input {...shared} />;
});
LocalField.displayName = 'LocalField';

export default LocalField;
