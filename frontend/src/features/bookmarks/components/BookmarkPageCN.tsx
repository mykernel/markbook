import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, ExternalLink, Bookmark, Menu, Upload } from 'lucide-react';
import { bookmarkApi } from '../api/bookmarkApi';
import { BookmarkDialogCN } from './BookmarkDialogCN';
import { FolderDialogCN } from '@/features/folders/components/FolderDialogCN';
import { ImportDialogCN } from '@/features/import/components/ImportDialogCN';
import { Sidebar } from '@/components/Sidebar';
import type { Bookmark as BookmarkType, Folder } from '~types';
import { SuspenseLoader } from '@/components/SuspenseLoader/SuspenseLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { folderApi } from '@/features/folders/api/folderApi';

const BookmarkPageContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | undefined>(undefined);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  // 获取文件夹列表
  const { data: folders = [] } = useSuspenseQuery({
    queryKey: ['folders'],
    queryFn: () => folderApi.getAll(),
  });

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data } = useSuspenseQuery({
    queryKey: ['bookmarks', page, debouncedSearch, selectedFolderId, selectedTag],
    queryFn: () => {
      const hasFilters = debouncedSearch.trim() || selectedFolderId !== null || selectedTag;

      if (hasFilters) {
        return bookmarkApi.search({
          query: debouncedSearch,
          folderId: selectedFolderId || undefined,
          tags: selectedTag ? [selectedTag] : undefined,
          page,
          limit: 20,
        });
      }
      return bookmarkApi.getAll(page, 20);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bookmarkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const handleDelete = useCallback((id: number, title: string) => {
    if (confirm(`确定要删除书签"${title}"吗？`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleOpenDialog = useCallback((bookmark?: BookmarkType) => {
    setEditingBookmark(bookmark);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingBookmark(undefined);
  }, []);

  const handleFolderSelect = useCallback((folderId: number | null) => {
    setSelectedFolderId(folderId);
    setPage(1);
  }, []);

  const handleTagSelect = useCallback((tagName: string | null) => {
    setSelectedTag(tagName);
    setPage(1);
  }, []);

  const handleAddFolder = useCallback(() => {
    setEditingFolder(null);
    setFolderDialogOpen(true);
  }, []);

  const handleCloseFolderDialog = useCallback(() => {
    setFolderDialogOpen(false);
    setEditingFolder(null);
  }, []);

  const handleEditFolder = useCallback((folder: Folder) => {
    setEditingFolder(folder);
    setFolderDialogOpen(true);
  }, []);

  const handleFolderDeleted = useCallback((deletedId: number) => {
    setSelectedFolderId(prev => (prev === deletedId ? null : prev));
    setPage(1);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      {sidebarOpen && (
        <Suspense fallback={<div className="w-64 h-screen bg-background border-r animate-pulse" />}>
          <Sidebar
            selectedFolderId={selectedFolderId}
            selectedTag={selectedTag}
            onFolderSelect={handleFolderSelect}
            onTagSelect={handleTagSelect}
            onAddFolder={handleAddFolder}
            onEditFolder={handleEditFolder}
          />
        </Suspense>
      )}

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* 页面标题 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    📚 我的书签
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    管理您的网页收藏，让知识触手可及
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <Upload className="h-5 w-5" />
                  导入书签
                </Button>
                <Button size="lg" className="gap-2" onClick={() => handleOpenDialog()}>
                  <Plus className="h-5 w-5" />
                  添加书签
                </Button>
              </div>
            </div>

            {/* 搜索栏和过滤器 */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="搜索书签标题、网址或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* 活动过滤器 */}
              {(selectedFolderId !== null || selectedTag) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">已选择:</span>
                  {selectedFolderId !== null && (
                    <Badge variant="secondary" className="gap-1">
                      文件夹过滤
                      <button onClick={() => handleFolderSelect(null)} className="ml-1">×</button>
                    </Badge>
                  )}
                  {selectedTag && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedTag}
                      <button onClick={() => handleTagSelect(null)} className="ml-1">×</button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* 书签列表 */}
            {data.bookmarks.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <Bookmark className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {searchQuery || selectedFolderId || selectedTag ? '没有找到匹配的书签' : '还没有书签'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {searchQuery || selectedFolderId || selectedTag
                        ? '尝试调整搜索条件或过滤器'
                        : '开始添加您的第一个书签，开启高效的知识管理之旅'}
                    </p>
                    <Button size="lg" className="gap-2" onClick={() => handleOpenDialog()}>
                      <Plus className="h-5 w-5" />
                      添加第一个书签
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.bookmarks.map((bookmark) => (
                    <Card key={bookmark.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg line-clamp-2">
                            {bookmark.title}
                          </CardTitle>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenDialog(bookmark)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-destructive"
                              onClick={() => handleDelete(bookmark.id, bookmark.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline group/link"
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{bookmark.url}</span>
                        </a>

                        {bookmark.description && (
                          <CardDescription className="line-clamp-2">
                            {bookmark.description}
                          </CardDescription>
                        )}

                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {bookmark.tags.map((bt) => (
                              <Badge
                                key={bt.tag.id}
                                variant="secondary"
                                className="text-xs cursor-pointer"
                                style={{
                                  backgroundColor: bt.tag.color || undefined,
                                  color: bt.tag.color ? '#fff' : undefined,
                                }}
                                onClick={() => handleTagToggle(bt.tag.name)}
                              >
                                {bt.tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {bookmark.folder && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                            <span>📁</span>
                            <span>{bookmark.folder.name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页 */}
                {data.pagination.totalPages && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      第 {page} 页，共 {data.pagination.totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === data.pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* 书签对话框 */}
            <Suspense fallback={null}>
              {dialogOpen && (
                <BookmarkDialogCN
                  open={dialogOpen}
                  onClose={handleCloseDialog}
                  bookmark={editingBookmark}
                />
              )}
            </Suspense>

            {/* 文件夹对话框 */}
            <Suspense fallback={null}>
              {folderDialogOpen && (
                <FolderDialogCN
                  open={folderDialogOpen}
                  onClose={handleCloseFolderDialog}
                  folder={editingFolder}
                  folders={folders}
                  onDeleted={handleFolderDeleted}
                />
              )}
            </Suspense>

            {/* 导入对话框 */}
            <Suspense fallback={null}>
              {importDialogOpen && (
                <ImportDialogCN
                  open={importDialogOpen}
                  onClose={() => setImportDialogOpen(false)}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookmarkPageCN: React.FC = () => {
  return (
    <SuspenseLoader>
      <BookmarkPageContent />
    </SuspenseLoader>
  );
};

export default BookmarkPageCN;
