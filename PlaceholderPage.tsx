import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

// صفحة مؤقتة لكل تبويب، لحد ما نفكك منطق AdminModal.tsx القديم
// (InboxTab/MusicTab/PagesTab/SettingsTab) لصفحات مستقلة في الخطوة الجاية
const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white/80 mb-3">{title}</h2>
        <p className="text-white/30">هذا القسم قيد النقل من الكود القديم — الخطوة الجاية.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
