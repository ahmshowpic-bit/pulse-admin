import React from 'react';

const FieldLabel: React.FC<{ children: React.ReactNode; accent?: boolean }> =
  React.memo(({ children, accent }) => (
    <label className={`block text-xs font-black mr-2 ${accent ? 'text-cyan-400' : 'text-white/40'}`}>
      {children}
    </label>
  ));
FieldLabel.displayName = 'FieldLabel';

export default FieldLabel;
