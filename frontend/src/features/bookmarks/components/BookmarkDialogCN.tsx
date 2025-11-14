import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { bookmarkApi } from '../api/bookmarkApi';
import { folderApi } from '@/features/folders/api/folderApi';
import type { Bookmark } from '~types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface BookmarkDialogCNProps {
  open: boolean;
  onClose: () => void;
  bookmark?: Bookmark;
}

export const BookmarkDialogCN: React.FC<BookmarkDialogCNProps> = ({
  open,
  onClose,
  bookmark,
}) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(bookmark);

  // 表单状态
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  // 加载文件夹
  const { data: folders } = useSuspenseQuery({
    queryKey: ['folders'],
    queryFn: () => folderApi.getAll(),
  });

  // 初始化表单数据
  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setDescription(bookmark.description || '');
      setSelectedTags(bookmark.tags?.map(bt => bt.tag.name) || []);
      setSelectedFolderId(bookmark.folderId || null);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setSelectedTags([]);
      setSelectedFolderId(null);
    }
  }, [bookmark, open]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: bookmarkApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      bookmarkApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      onClose();
    },
  });

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, selectedTags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  }, [selectedTags]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim() || !url.trim()) {
        alert('请填写标题和网址');
        return;
      }

      const data = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        folderId: selectedFolderId || undefined,
        tags: selectedTags,
      };

      if (isEdit && bookmark) {
        updateMutation.mutate({ id: bookmark.id, data });
      } else {
        createMutation.mutate(data);
      }
    },
    [title, url, description, selectedTags, selectedFolderId, isEdit, bookmark, createMutation, updateMutation]
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑书签' : '添加新书签'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改书签信息' : '填写书签信息，开始收藏您喜欢的网页'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              placeholder="输入书签标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">网址 *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="添加一些描述信息（可选）..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="输入标签后按回车..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">文件夹</Label>
            <select
              id="folder"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedFolderId || ''}
              onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">无文件夹</option>
              {folders?.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '保存中...' : isEdit ? '保存修改' : '创建书签'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkDialogCN;
