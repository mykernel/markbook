import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AiSuggestion, Bookmark } from '~types';

interface AiSuggestionDialogProps {
  open: boolean;
  loading: boolean;
  suggestions: AiSuggestion[];
  bookmarks: Bookmark[];
  profile?: string;
  applyingAll: boolean;
  existingFolders: string[];
  existingTags: string[];
  onClose: () => void;
  onRefresh: () => void;
  onApply: (suggestion: AiSuggestion) => Promise<void>;
  onApplyAll: () => Promise<void>;
}

export const AiSuggestionDialog: React.FC<AiSuggestionDialogProps> = ({
  open,
  loading,
  suggestions,
  bookmarks,
  profile,
  applyingAll,
  existingFolders,
  existingTags,
  onClose,
  onRefresh,
  onApply,
  onApplyAll,
}) => {
  const getBookmarkTitle = (id: number) =>
    bookmarks.find(b => b.id === id)?.title ?? `书签 #${id}`;

  const folderSet = new Set(existingFolders.map(name => name.toLowerCase()));
  const tagSet = new Set(existingTags.map(tag => tag.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI 整理建议</DialogTitle>
        </DialogHeader>

        {profile && (
          <p className="text-sm text-muted-foreground">
            当前职业/偏好：<span className="font-medium text-foreground">{profile}</span>
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">AI 正在分析书签，请稍候...</p>
        ) : suggestions.length === 0 ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>暂无可用建议。</p>
            <Button variant="outline" onClick={onRefresh}>
              重新生成
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRefresh}>
                重新生成
              </Button>
              <Button
                size="sm"
                onClick={onApplyAll}
                disabled={applyingAll}
                className="gap-1"
              >
                {applyingAll ? '正在应用...' : '一键应用全部'}
              </Button>
            </div>
            {suggestions.map(item => {
              const folderName = item.recommendedFolder?.trim();
              const isNewFolder =
                folderName && !folderSet.has(folderName.toLowerCase());
              return (
                <div
                  key={item.bookmarkId}
                  className="rounded-lg border p-4 space-y-3 text-sm"
                >
                  <div className="font-medium text-foreground">
                    {getBookmarkTitle(item.bookmarkId)}
                  </div>
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    {folderName && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">目录：</span>
                        <span className="text-foreground">{folderName}</span>
                        {isNewFolder && (
                          <Badge variant="secondary" className="text-xs">
                            新建
                          </Badge>
                        )}
                      </div>
                    )}
                    {item.recommendedTags && item.recommendedTags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">标签：</span>
                        {item.recommendedTags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                            {!tagSet.has(tag.toLowerCase()) && (
                              <span className="ml-1 text-primary">新</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {item.reason && (
                      <p className="text-xs text-muted-foreground leading-snug">
                        原因：{item.reason}
                      </p>
                    )}
                  </div>
                  <div className="pt-2">
                    <Button size="sm" onClick={() => onApply(item)}>
                      应用
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
