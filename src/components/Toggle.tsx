import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: 'cyan' | 'purple';
}

const Toggle: React.FC<ToggleProps> = React.memo(({ checked, onChange, color = 'cyan' }) => (
  <label className="relative inline-flex items-center cursor-pointer shrink-0">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <div
      className={`w-14 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform ${
        color === 'purple' ? 'peer-checked:bg-purple-600' : 'peer-checked:bg-cyan-500'
      }`}
    />
  </label>
));
Toggle.displayName = 'Toggle';

export default Toggle;
