import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, ExternalLink, Bookmark, Menu, Upload } from 'lucide-react';
import { bookmarkApi } from '../api/bookmarkApi';
import { BookmarkDialogCN } from './BookmarkDialogCN';
import { FolderDialogCN } from '@/features/folders/components/FolderDialogCN';
import { BulkMoveDialog } from '@/features/folders/components/BulkMoveDialog';
import { ImportDialogCN } from '@/features/import/components/ImportDialogCN';
import { Sidebar } from '@/components/Sidebar';
import type {
  Bookmark as BookmarkType,
  Folder,
  BookmarkSortOption,
  BulkActionInput,
  AiSuggestion,
} from '~types';
import { SuspenseLoader } from '@/components/SuspenseLoader/SuspenseLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { folderApi } from '@/features/folders/api/folderApi';
import { tagApi } from '@/features/tags/api/tagApi';
import { AiSuggestionDialog } from './AiSuggestionDialog';
import { aiApi } from '@/features/ai/api/aiApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [sortOption, setSortOption] = useState<BookmarkSortOption>('createdAt');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [bulkMoveFolderId, setBulkMoveFolderId] = useState<number | null>(null);
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
  const [bulkAddTags, setBulkAddTags] = useState('');
  const [bulkRemoveTags, setBulkRemoveTags] = useState('');
  const [bulkResultMessage, setBulkResultMessage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState('');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [applyingAllAi, setApplyingAllAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const queryClient = useQueryClient();

  // 获取文件夹列表
  const { data: folders = [] } = useSuspenseQuery({
    queryKey: ['folders'],
    queryFn: () => folderApi.getAll(),
  });

  const { data: tags = [] } = useSuspenseQuery({
    queryKey: ['tags'],
    queryFn: () => tagApi.getAll(),
  });

  const { data: topVisitedData } = useSuspenseQuery({
    queryKey: ['bookmarks', 'stats', 'visitCount'],
    queryFn: () => bookmarkApi.getAll(1, 5, 'visitCount'),
  });

  const { data: recentVisitedData } = useSuspenseQuery({
    queryKey: ['bookmarks', 'stats', 'lastVisitedAt'],
    queryFn: () => bookmarkApi.getAll(1, 5, 'lastVisitedAt'),
  });

  const topVisited = useMemo(
    () => topVisitedData?.bookmarks ?? [],
    [topVisitedData]
  );

  const recentVisited = useMemo(
    () => recentVisitedData?.bookmarks.filter(bookmark => bookmark.lastVisitedAt) ?? [],
    [recentVisitedData]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('bookmark_sort_option');
    if (saved === 'createdAt' || saved === 'visitCount' || saved === 'lastVisitedAt') {
      setSortOption(saved);
    }

    const savedProfile = localStorage.getItem('bookmark_user_profile');
    if (savedProfile) {
      setUserProfile(savedProfile);
    }

    const savedView = localStorage.getItem('bookmark_view_mode');
    if (savedView === 'card' || savedView === 'table') {
      setViewMode(savedView);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bookmark_sort_option', sortOption);
  }, [sortOption]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bookmark_user_profile', userProfile);
  }, [userProfile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bookmark_view_mode', viewMode);
  }, [viewMode]);

  const selectedFolderLabel = useMemo(() => {
    if (bulkMoveFolderId === null) return '根目录';
    const target = folders.find(folder => folder.id === bulkMoveFolderId);
    return target?.name ?? '根目录';
  }, [bulkMoveFolderId, folders]);

  const rootFolderCount = useMemo(
    () => folders.filter(folder => folder.parentId === null).length,
    [folders]
  );

  const tagCount = tags.length;

  useEffect(() => {
    if (!bulkResultMessage) return;
    const timer = setTimeout(() => setBulkResultMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [bulkResultMessage]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const highlightTerm = debouncedSearch.trim();
  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightText = useCallback(
    (text: string) => {
      if (!highlightTerm) return text;
      const regex = new RegExp(`(${escapeRegex(highlightTerm)})`, 'gi');
      return text.split(regex).map((part, idx) =>
        regex.test(part) ? (
          <mark key={`${part}-${idx}`} className="bg-yellow-200 text-slate-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={`${part}-plain-${idx}`}>{part}</span>
        )
      );
    },
    [highlightTerm]
  );

  const { data } = useSuspenseQuery({
    queryKey: ['bookmarks', page, debouncedSearch, selectedFolderId, selectedTag, sortOption],
    queryFn: () => {
      const hasFilters = debouncedSearch.trim() || selectedFolderId !== null || selectedTag;

      if (hasFilters) {
        return bookmarkApi.search({
          query: debouncedSearch,
          folderId: selectedFolderId || undefined,
          tags: selectedTag ? [selectedTag] : undefined,
          page,
          limit: 20,
          sort: sortOption,
        });
      }
      return bookmarkApi.getAll(page, 20, sortOption);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bookmarkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(bookmarkId => bookmarkId !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(data.bookmarks.map(bookmark => bookmark.id));
  }, [data]);

  const handleBulk = useCallback(
    async (payload: Omit<BulkActionInput, 'bookmarkIds'>) => {
      if (selectedIds.length === 0) return;
      try {
        await bookmarkApi.bulkAction({
          ...payload,
          bookmarkIds: selectedIds,
        });
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        queryClient.invalidateQueries({ queryKey: ['folders'] });
        queryClient.invalidateQueries({ queryKey: ['tags'] });
        clearSelection();
        setBulkAddTags('');
        setBulkRemoveTags('');

        let summary: string | null = null;
        switch (payload.action) {
          case 'delete':
            summary = `已删除 ${selectedIds.length} 个书签`;
            break;
          case 'move': {
            const targetName =
              payload.targetFolderId !== null && payload.targetFolderId !== undefined
                ? folders.find(folder => folder.id === payload.targetFolderId)?.name ?? '根目录'
                : '根目录';
            summary = `已移动 ${selectedIds.length} 个书签到 ${targetName}`;
            break;
          }
          case 'addTags':
            summary = `已为 ${selectedIds.length} 个书签添加标签：${(payload.tags || []).join(', ')}`;
            break;
          case 'removeTags':
            summary = `已为 ${selectedIds.length} 个书签移除标签：${(payload.tags || []).join(', ')}`;
            break;
          default:
            summary = null;
        }
        if (summary) {
          setBulkResultMessage(summary);
        }
      } catch (error) {
        console.error('Bulk action failed', error);
        alert('批量操作失败，请稍后重试');
      }
    },
    [selectedIds, queryClient, clearSelection, folders]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定删除选中的 ${selectedIds.length} 个书签吗？`)) {
      handleBulk({ action: 'delete' });
    }
  }, [handleBulk, selectedIds.length]);

  const confirmBulkMove = useCallback(() => {
    if (selectedIds.length === 0) {
      alert('请先选择要移动的书签');
      return;
    }
    handleBulk({ action: 'move', targetFolderId: bulkMoveFolderId ?? null });
    setBulkMoveDialogOpen(false);
  }, [handleBulk, bulkMoveFolderId, selectedIds.length]);

  const handleBulkAddTags = useCallback(() => {
    const tags = bulkAddTags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    if (tags.length === 0) return;
    handleBulk({ action: 'addTags', tags });
  }, [handleBulk, bulkAddTags]);

  const handleBulkRemoveTags = useCallback(() => {
    const tags = bulkRemoveTags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    if (tags.length === 0) return;
    handleBulk({ action: 'removeTags', tags });
  }, [handleBulk, bulkRemoveTags]);

  const fetchAiSuggestions = useCallback(async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要整理的书签');
      return;
    }

    try {
      setAiLoading(true);
      const suggestions = await aiApi.organize(selectedIds, userProfile.trim() || undefined);
      setAiSuggestions(suggestions);
      setAiDialogOpen(true);
    } catch (error) {
      console.error('获取 AI 建议失败', error);
      alert('获取 AI 建议失败，请稍后重试');
    } finally {
      setAiLoading(false);
    }
  }, [selectedIds]);

  const ensureFolderPath = useCallback(
    async (folderPath?: string | null): Promise<number | null> => {
      if (!folderPath || !folderPath.trim()) {
        return null;
      }

      const parts = folderPath
        .split('/')
        .map(part => part.trim())
        .filter(Boolean);

      if (parts.length === 0) {
        return null;
      }

      if (parts.length > 2) {
        throw new Error('仅支持两级文件夹结构，请选择已有目录或精简路径');
      }

      let allFolders = [...folders];
      let parentId: number | null = null;

      for (const part of parts) {
        let match = allFolders.find(
          folder => folder.name === part && folder.parentId === parentId
        );

        if (!match) {
          const created = await folderApi.create({ name: part, parentId: parentId ?? undefined });
          match = created;
          allFolders = [...allFolders, created];
          await queryClient.invalidateQueries({ queryKey: ['folders'] });
        }

        parentId = match.id;
      }

      return parentId;
    },
    [folders, queryClient]
  );

  const applyAiSuggestion = useCallback(
    async (suggestion: AiSuggestion, options?: { silent?: boolean }) => {
      try {
        const bookmarkId = suggestion.bookmarkId;
        if (suggestion.recommendedFolder) {
          const folderId = await ensureFolderPath(suggestion.recommendedFolder);
          await bookmarkApi.bulkAction({
            action: 'move',
            bookmarkIds: [bookmarkId],
            targetFolderId: folderId ?? null,
          });
        }

        if (
          suggestion.recommendedTags &&
          suggestion.recommendedTags.length > 0 &&
          suggestion.recommendedTags.length <= 3
        ) {
          await bookmarkApi.bulkAction({
            action: 'addTags',
            bookmarkIds: [bookmarkId],
            tags: suggestion.recommendedTags,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        queryClient.invalidateQueries({ queryKey: ['folders'] });
        queryClient.invalidateQueries({ queryKey: ['tags'] });
        if (!options?.silent) {
          alert(`已应用 ${bookmarkId} 的整理建议`);
        }
      } catch (error) {
        console.error('应用 AI 建议失败', error);
        alert('应用 AI 建议失败，请稍后再试');
      }
    },
    [ensureFolderPath, queryClient]
  );

  const handleDelete = useCallback((id: number, title: string) => {
    if (confirm(`确定要删除书签"${title}"吗？`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const applyAllSuggestions = useCallback(async () => {
    if (aiSuggestions.length === 0) return;
    setApplyingAllAi(true);
    try {
      for (const suggestion of aiSuggestions) {
        await applyAiSuggestion(suggestion, { silent: true });
      }
      alert('已应用全部 AI 建议');
      setAiDialogOpen(false);
      clearSelection();
    } catch (error) {
      console.error('批量应用 AI 建议失败', error);
      alert('批量应用 AI 建议失败，请稍后再试');
    } finally {
      setApplyingAllAi(false);
    }
  }, [aiSuggestions, applyAiSuggestion, clearSelection]);

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

  const handleSortChange = useCallback((value: BookmarkSortOption) => {
    setSortOption(value);
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

  const handleVisit = useCallback(
    async (id: number) => {
      try {
        await bookmarkApi.trackVisit(id);
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      } catch (error) {
        console.error('记录访问失败', error);
      }
    },
    [queryClient]
  );

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

            {/* 访问统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">热门书签</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {topVisited.length === 0 ? (
                    <p className="text-muted-foreground">暂无数据</p>
                  ) : (
                    topVisited.map(bookmark => (
                      <a
                        key={bookmark.id}
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-between gap-3 hover:text-primary transition-colors"
                      >
                        <span className="truncate">{bookmark.title}</span>
                        <span className="text-xs text-muted-foreground">
                          访问 {bookmark.visitCount}
                        </span>
                      </a>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">最近访问</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {recentVisited.length === 0 ? (
                    <p className="text-muted-foreground">暂无数据</p>
                  ) : (
                    recentVisited.map(bookmark => (
                      <a
                        key={bookmark.id}
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-between gap-3 hover:text-primary transition-colors"
                      >
                        <span className="truncate">{bookmark.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {bookmark.lastVisitedAt &&
                            new Date(bookmark.lastVisitedAt).toLocaleString('zh-CN')}
                        </span>
                      </a>
                    ))
                  )}
                </CardContent>
              </Card>

            </div>

            {/* 搜索栏和过滤器 */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索书签标题、网址或描述..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">排序:</span>
                    <Select
                      value={sortOption}
                      onValueChange={(value) => handleSortChange(value as BookmarkSortOption)}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="选择排序" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">最新收藏</SelectItem>
                        <SelectItem value="visitCount">访问次数</SelectItem>
                        <SelectItem value="lastVisitedAt">最近访问</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">视图:</span>
                    <div className="inline-flex rounded-md border bg-muted/50">
                      <Button
                        type="button"
                        variant={viewMode === 'card' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setViewMode('card')}
                      >
                        卡片
                      </Button>
                      <Button
                        type="button"
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        className="rounded-none"
                        onClick={() => setViewMode('table')}
                      >
                        表格
                      </Button>
                    </div>
                  </div>
                </div>
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

              {selectedIds.length > 0 && (
                <Card className="p-4 space-y-4 border-dashed border-primary/40">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-medium">
                      已选择 {selectedIds.length} 个书签
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>根目录 {rootFolderCount}/5</span>
                      <span>标签 {tagCount}/50</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleSelectAll}>
                        选择当前页
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearSelection}>
                        清空选择
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 items-center">
                      <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="min-w-[140px]"
                      >
                        批量删除
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setBulkMoveDialogOpen(true)}>
                          批量移动
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          目标：{selectedFolderLabel}
                        </span>
                      </div>
                      <Button variant="outline" onClick={fetchAiSuggestions} disabled={aiLoading}>
                        {aiLoading ? 'AI 分析中...' : 'AI 整理建议'}
                      </Button>
                      <div className="flex flex-col gap-1">
                        <Input
                          value={userProfile}
                          onChange={(e) => setUserProfile(e.target.value)}
                          placeholder="职业/偏好（例：运维工程师）"
                          className="w-64"
                        />
                        <span className="text-[11px] text-muted-foreground">
                          AI 将结合此信息推荐更贴合的目录和标签
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={bulkAddTags}
                          onChange={(e) => setBulkAddTags(e.target.value)}
                          placeholder="添加标签，逗号分隔"
                        />
                        <Button variant="outline" onClick={handleBulkAddTags}>
                          批量添加标签
                        </Button>
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={bulkRemoveTags}
                          onChange={(e) => setBulkRemoveTags(e.target.value)}
                          placeholder="移除标签，逗号分隔"
                        />
                        <Button variant="outline" onClick={handleBulkRemoveTags}>
                          批量移除标签
                        </Button>
                      </div>
                    </div>
                    {bulkResultMessage && (
                      <div className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
                        {bulkResultMessage}
                      </div>
                    )}
                  </div>
                </Card>
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
            ) : viewMode === 'card' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.bookmarks.map((bookmark) => (
                    <Card
                      key={bookmark.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                    >
                      <CardHeader className="pb-3 border-b">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 accent-primary"
                              checked={selectedIds.includes(bookmark.id)}
                              onChange={() => toggleSelection(bookmark.id)}
                            />
                            <CardTitle className="text-lg line-clamp-2">
                              {highlightTerm ? highlightText(bookmark.title) : bookmark.title}
                            </CardTitle>
                          </div>
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
                      <CardContent className="flex flex-col flex-1 space-y-3">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline group/link"
                          onClick={() => handleVisit(bookmark.id)}
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {highlightTerm ? highlightText(bookmark.url) : bookmark.url}
                          </span>
                        </a>

                        <CardDescription className="line-clamp-2 min-h-[48px] text-muted-foreground">
                          {highlightTerm && bookmark.description
                            ? highlightText(bookmark.description)
                            : bookmark.description || '暂无描述'}
                        </CardDescription>

                        <div className="flex flex-wrap gap-2 pt-2 min-h-[44px] border-y py-2">
                          {bookmark.tags && bookmark.tags.length > 0 ? (
                            bookmark.tags.map((bt) => (
                              <Badge
                                key={bt.tag.id}
                                variant="secondary"
                                className="text-xs cursor-pointer"
                                style={{
                                  backgroundColor: bt.tag.color || undefined,
                                  color: bt.tag.color ? '#fff' : undefined,
                                }}
                                onClick={() =>
                                  handleTagSelect(
                                    selectedTag === bt.tag.name ? null : bt.tag.name
                                  )
                                }
                              >
                                {bt.tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">暂无标签</span>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-3 pt-2 flex-wrap mt-auto">
                          <div className="flex items-center gap-1">
                            <span>访问</span>
                            <span>{bookmark.visitCount}</span>
                          </div>
                          {bookmark.lastVisitedAt && (
                            <div className="flex items-center gap-1">
                              <span>最近</span>
                              <span>{new Date(bookmark.lastVisitedAt).toLocaleString('zh-CN')}</span>
                            </div>
                          )}
                          {bookmark.folder && (
                            <div className="flex items-center gap-1">
                              <span>📁</span>
                              <span>{bookmark.folder.name}</span>
                            </div>
                          )}
                        </div>
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
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border bg-card mb-8">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2 w-10">
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={
                              selectedIds.length > 0 &&
                              selectedIds.length === data.bookmarks.length
                            }
                            onChange={() => {
                              if (selectedIds.length === data.bookmarks.length) {
                                clearSelection();
                              } else {
                                setSelectedIds(data.bookmarks.map(b => b.id));
                              }
                            }}
                          />
                        </th>
                        <th className="px-3 py-2 text-left">书签</th>
                        <th className="px-3 py-2 text-left w-40">文件夹</th>
                        <th className="px-3 py-2 text-left w-56">标签</th>
                        <th className="px-3 py-2 text-left w-24">访问</th>
                        <th className="px-3 py-2 text-left w-40">最近访问</th>
                        <th className="px-3 py-2 w-28 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookmarks.map(bookmark => (
                        <tr
                          key={bookmark.id}
                          className="border-t text-sm hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-3 py-3 align-top">
                            <input
                              type="checkbox"
                              className="accent-primary"
                              checked={selectedIds.includes(bookmark.id)}
                              onChange={() => toggleSelection(bookmark.id)}
                            />
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="font-medium text-foreground">
                              {highlightTerm ? highlightText(bookmark.title) : bookmark.title}
                            </div>
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={() => handleVisit(bookmark.id)}
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="truncate">
                                {highlightTerm ? highlightText(bookmark.url) : bookmark.url}
                              </span>
                            </a>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {highlightTerm && bookmark.description
                                ? highlightText(bookmark.description)
                                : bookmark.description || '暂无描述'}
                            </p>
                          </td>
                          <td className="px-3 py-3 align-top text-sm text-muted-foreground">
                            {bookmark.folder?.name ?? '根目录'}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {bookmark.tags && bookmark.tags.length > 0 ? (
                                bookmark.tags.map(bt => (
                                  <Badge
                                    key={bt.tag.id}
                                    variant="secondary"
                                    className="text-xs cursor-pointer"
                                    onClick={() =>
                                      handleTagSelect(
                                        selectedTag === bt.tag.name ? null : bt.tag.name
                                      )
                                    }
                                  >
                                    {bt.tag.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top text-sm">
                            {bookmark.visitCount}
                          </td>
                          <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                            {bookmark.lastVisitedAt
                              ? new Date(bookmark.lastVisitedAt).toLocaleString('zh-CN')
                              : '—'}
                          </td>
                          <td className="px-3 py-3 align-top text-center">
                            <div className="flex items-center justify-center gap-1">
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
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(bookmark.id, bookmark.title)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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

            {bulkMoveDialogOpen && (
              <BulkMoveDialog
                open={bulkMoveDialogOpen}
                onClose={() => setBulkMoveDialogOpen(false)}
                folders={folders}
                selectedFolderId={bulkMoveFolderId}
                onSelect={setBulkMoveFolderId}
                onConfirm={confirmBulkMove}
              />
            )}

            <AiSuggestionDialog
              open={aiDialogOpen}
              loading={aiLoading}
              suggestions={aiSuggestions}
              bookmarks={data.bookmarks}
              profile={userProfile.trim() || undefined}
              applyingAll={applyingAllAi}
              existingFolders={folders.map(folder => folder.name)}
              existingTags={tags.map(tag => tag.name)}
              onClose={() => setAiDialogOpen(false)}
              onRefresh={fetchAiSuggestions}
              onApply={applyAiSuggestion}
              onApplyAll={applyAllSuggestions}
            />

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
