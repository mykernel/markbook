import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { folderApi } from '@/features/folders/api/folderApi';
import type { Folder } from '~types';
import { useQueryClient } from '@tanstack/react-query';

interface FolderDialogCNProps {
  open: boolean;
  onClose: () => void;
  folder?: Folder | null;
  folders: Folder[];
  onDeleted?: (folderId: number) => void;
}

export const FolderDialogCN: React.FC<FolderDialogCNProps> = ({
  open,
  onClose,
  folder,
  folders,
  onDeleted,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (folder) {
        setName(folder.name);
        setParentId(folder.parentId ?? null);
      } else {
        setName('');
        setParentId(null);
      }
    }
  }, [open, folder]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入文件夹名称');
      return;
    }

    setLoading(true);
    try {
      if (folder) {
        await folderApi.update(folder.id, { name: name.trim(), parentId: parentId ?? undefined });
      } else {
        await folderApi.create({ name: name.trim(), parentId: parentId ?? undefined });
      }
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      onClose();
    } catch (error) {
      console.error('保存文件夹失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!folder) return;
    if (!confirm(`确定要删除文件夹“${folder.name}”及其子文件夹吗？`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      await folderApi.delete(folder.id);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      onDeleted?.(folder.id);
      onClose();
    } catch (error) {
      console.error('删除文件夹失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 构建可选的父文件夹列表（排除当前文件夹及其子文件夹）
  const buildFolderTree = (allFolders: Folder[], excludeId?: number): Folder[] => {
    if (!excludeId) return allFolders;

    const excludeIds = new Set<number>([excludeId]);
    const findChildIds = (id: number) => {
      allFolders.forEach(f => {
        if (f.parentId === id && !excludeIds.has(f.id)) {
          excludeIds.add(f.id);
          findChildIds(f.id);
        }
      });
    };
    findChildIds(excludeId);

    return allFolders.filter(f => !excludeIds.has(f.id));
  };

  const availableFolders = buildFolderTree(folders, folder?.id);

  // 渲染文件夹选项（带层级缩进）
  const renderFolderOptions = (folderId: number | null = null, level = 0): React.ReactNode[] => {
    return availableFolders
      .filter(f => f.parentId === folderId)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      .flatMap(f => [
        <SelectItem key={f.id} value={f.id.toString()}>
          {'\u00A0\u00A0'.repeat(level)}📁 {f.name}
        </SelectItem>,
        ...renderFolderOptions(f.id, level + 1),
      ]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{folder ? '编辑文件夹' : '创建文件夹'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="folder-name">文件夹名称 *</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入文件夹名称"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parent-folder">父文件夹（可选）</Label>
            <Select
              value={parentId?.toString() || 'none'}
              onValueChange={(value) => setParentId(value === 'none' ? null : parseInt(value))}
            >
              <SelectTrigger id="parent-folder">
                <SelectValue placeholder="选择父文件夹" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无（根文件夹）</SelectItem>
                {renderFolderOptions()}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {folder && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || deleteLoading}
            >
              {deleteLoading ? '删除中...' : '删除文件夹'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
