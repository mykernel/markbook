import React from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { Bookmark } from '~types';
import { Button } from '@/components/ui/button';

interface InsightsPanelProps {
  statsTab: 'top' | 'recent';
  statsCollapsed: boolean;
  statsList: Bookmark[];
  onTabChange: (tab: 'top' | 'recent') => void;
  onToggleCollapse: () => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  statsTab,
  statsCollapsed,
  statsList,
  onTabChange,
  onToggleCollapse,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/75 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">访问洞察</h2>
          <p className="text-sm text-muted-foreground">热门与最近访问在此切换，保持与头部仪表盘的连续感</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-slate-200 bg-white/80 p-1 text-sm dark:border-slate-700 dark:bg-slate-900">
            {(['top', 'recent'] as const).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  statsTab === key
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {key === 'top' ? '热门书签' : '最近访问'}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={onToggleCollapse}>
            {statsCollapsed ? '展开' : '收起'}
            {statsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {!statsCollapsed && (
        <div className="mt-4 space-y-3">
          {statsList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-muted-foreground dark:border-slate-700">
              {statsTab === 'top' ? '暂无热门书签数据' : '暂无最近访问记录'}
            </div>
          ) : (
            statsList.map((bookmark, index) => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 transition-colors hover:border-primary/60 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium text-slate-900 dark:text-white">
                    {bookmark.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {statsTab === 'top'
                      ? `访问 ${bookmark.visitCount}`
                      : bookmark.lastVisitedAt
                      ? new Date(bookmark.lastVisitedAt).toLocaleString('zh-CN')
                      : '尚未记录访问时间'}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 transition-colors group-hover:text-primary" />
              </a>
            ))
          )}
        </div>
      )}
    </section>
  );
};
