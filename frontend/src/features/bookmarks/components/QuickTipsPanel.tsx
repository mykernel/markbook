import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuickTipsPanel: React.FC<{ onImport: () => void }> = ({ onImport }) => {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">快速提示</h3>
      <p className="text-sm text-muted-foreground">
        结合 AI 建议、批量操作与导入能力，更快整理大量书签。
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• 批量选择后可直接触发 AI 整理。</li>
        <li>• 职业画像越具体，推荐的目录/标签越精准。</li>
        <li>• 导入前可先备份 export，避免重复。</li>
      </ul>
      <Button variant="outline" className="w-full gap-2" onClick={onImport}>
        <Upload className="h-4 w-4" />
        快速导入书签
      </Button>
    </section>
  );
};

export default QuickTipsPanel;
