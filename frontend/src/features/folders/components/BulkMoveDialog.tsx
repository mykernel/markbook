import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Folder } from '~types';

interface BulkMoveDialogProps {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  selectedFolderId: number | null;
  onSelect: (folderId: number | null) => void;
  onConfirm: () => void;
}

export const BulkMoveDialog: React.FC<BulkMoveDialogProps> = ({
  open,
  onClose,
  folders,
  selectedFolderId,
  onSelect,
  onConfirm,
}) => {
  const folderTree = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
    [folders]
  );

  const renderFolderOption = (folder: Folder, level: number = 0) => {
    const children = folderTree
      .filter(f => f.parentId === folder.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-accent transition-colors ${
            isSelected ? 'bg-accent font-medium' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span className="flex-1 truncate">{folder.name}</span>
          {isSelected && <span className="text-xs text-primary">已选</span>}
        </button>
        {children.length > 0 && (
          <div className="mt-1 space-y-1">
            {children.map(child => renderFolderOption(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folderTree.filter(folder => folder.parentId === null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>选择目标文件夹</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-accent transition-colors ${
              selectedFolderId === null ? 'bg-accent font-medium' : ''
            }`}
          >
            根目录
            {selectedFolderId === null && (
              <span className="text-xs text-primary">已选</span>
            )}
          </button>
          {rootFolders.length ? (
            rootFolders.map(folder => renderFolderOption(folder))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">暂无文件夹</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onConfirm}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkMoveDialog;
