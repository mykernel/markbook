import React from 'react';
import type { AiSuggestion } from '~types';
import { Button } from '@/components/ui/button';

interface SmartOrganizePanelProps {
  selectedCount: number;
  aiSuggestions: AiSuggestion[];
  loading: boolean;
  onFetch: () => void;
  onApply: (suggestion: AiSuggestion) => void;
  onApplyAll: () => void;
  onOpenDialog: () => void;
}

export const SmartOrganizePanel: React.FC<SmartOrganizePanelProps> = ({
  selectedCount,
  aiSuggestions,
  loading,
  onFetch,
  onApply,
  onApplyAll,
  onOpenDialog,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">智能整理</h3>
        <span className="text-xs text-muted-foreground">{selectedCount} 个已选</span>
      </div>
      <p className="text-sm text-muted-foreground">
        选择书签后可快速获取 AI 推荐目录/标签，也可以打开完整对话框查看更多细节。
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onFetch} disabled={loading || selectedCount === 0}>
          {loading ? '整理中…' : '获取 AI 建议'}
        </Button>
        <Button size="sm" variant="outline" onClick={onOpenDialog} disabled={selectedCount === 0}>
          打开整理面板
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onApplyAll}
          disabled={aiSuggestions.length === 0}
        >
          应用全部
        </Button>
      </div>
      {aiSuggestions.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {aiSuggestions.map(item => (
            <div
              key={item.bookmarkId}
              className="rounded-lg border border-dashed border-slate-200 p-3 text-xs space-y-1 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 dark:text-white">
                  #{item.bookmarkId}
                </span>
                <Button size="sm" variant="ghost" onClick={() => onApply(item)}>
                  应用
                </Button>
              </div>
              <p>目录：{item.recommendedFolder ?? '保持不变'}</p>
              <p>标签：{item.recommendedTags?.join(', ') ?? '保持不变'}</p>
              {item.reason && <p className="text-muted-foreground line-clamp-2">原因：{item.reason}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-muted-foreground dark:border-slate-700">
          当前没有可预览的建议，选择书签后点击“获取 AI 建议”即可生成。
        </div>
      )}
    </section>
  );
};

export default SmartOrganizePanel;
