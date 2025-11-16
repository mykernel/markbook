import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Bookmark,
  Upload,
  Layers,
  Tag,
  Folder as FolderIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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
  const [sortOption, setSortOption] = useState<BookmarkSortOption>('createdAt');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [statsTab, setStatsTab] = useState<'top' | 'recent'>('top');
  const [overviewCollapsed, setOverviewCollapsed] = useState(false);
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
    const savedSort = localStorage.getItem('bookmark_sort_option');
    if (savedSort === 'createdAt' || savedSort === 'visitCount' || savedSort === 'lastVisitedAt') {
      setSortOption(savedSort);
    }

    const savedProfile = localStorage.getItem('bookmark_user_profile');
    if (savedProfile) {
      setUserProfile(savedProfile);
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



  const selectedFolderLabel = useMemo(() => {
    if (bulkMoveFolderId === null) return '根目录';
    const target = folders.find(folder => folder.id === bulkMoveFolderId);
    return target?.name ?? '根目录';
  }, [bulkMoveFolderId, folders]);

  const activeFilterLabel = useMemo(() => {
    if (debouncedSearch.trim()) {
      return `搜索 “${debouncedSearch.trim()}”`;
    }
    if (selectedTag) {
      return `标签「${selectedTag}」`;
    }
    if (selectedFolderId !== null) {
      const folder = folders.find(item => item.id === selectedFolderId);
      return folder ? `文件夹「${folder.name}」` : '文件夹筛选';
    }
    return '全部书签';
  }, [debouncedSearch, selectedFolderId, selectedTag, folders]);

  const hasActiveFilters = useMemo(
    () => Boolean(debouncedSearch.trim() || selectedFolderId !== null || selectedTag),
    [debouncedSearch, selectedFolderId, selectedTag]
  );

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
  const totalBookmarks = data.pagination?.total ?? data.bookmarks.length;
  const cellPadding = 'py-2';
  const titleSpacing = 'space-y-1';
  const metaTextSize = 'text-xs';
  const statsList = statsTab === 'top' ? topVisited : recentVisited;

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedFolderId(null);
    setSelectedTag(null);
    setPage(1);
  };

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
    <div className="relative flex h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-background">
        <Suspense fallback={<div className="w-72 h-full bg-background border-r animate-pulse" />}>
          <Sidebar
            selectedFolderId={selectedFolderId}
            selectedTag={selectedTag}
            onFolderSelect={handleFolderSelect}
            onTagSelect={handleTagSelect}
            onAddFolder={handleAddFolder}
            onEditFolder={handleEditFolder}
          />
        </Suspense>
      </aside>

      <div className="flex-1 overflow-y-auto ml-72">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="mx-auto max-w-[1400px] px-10 py-10">
            <div className="space-y-8">
              {/* 顶部信息栏 */}
              <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      📚 我的书签
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      桌面优先，核心列表首屏可见，辅助数据可随时展开
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setImportDialogOpen(true)}
                    >
                      <Upload className="h-5 w-5" />
                      导入书签
                    </Button>
                    <Button className="gap-2" onClick={() => handleOpenDialog()}>
                      <Plus className="h-5 w-5" />
                      添加书签
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setOverviewCollapsed(prev => !prev)}
                      title={overviewCollapsed ? '展开摘要' : '收起摘要'}
                    >
                      {overviewCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                {overviewCollapsed ? (
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                      <Bookmark className="h-4 w-4 text-primary" />
                      {totalBookmarks} 个书签
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                      <Layers className="h-4 w-4 text-amber-500" />
                      根目录 {rootFolderCount}/5
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                      <Tag className="h-4 w-4 text-emerald-500" />
                      标签 {tagCount}/50
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                      <Search className="h-4 w-4 text-slate-500" />
                      当前：{activeFilterLabel}
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                      <Bookmark className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          全部书签
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {totalBookmarks}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                      <Layers className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          根目录配额
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {rootFolderCount} / 5
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                      <Tag className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          标签配额
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {tagCount} / 50
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300/80 bg-white/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
                      <Search className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          当前视图
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activeFilterLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  {/* 搜索栏和过滤器 */}
                  <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80 space-y-4">
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
                  </section>

                  {selectedIds.length > 0 && (
                    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-4">
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
                    </section>
                  )}

                  {/* 书签列表 */}
                  <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
                    {data.bookmarks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Search className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                          {hasActiveFilters ? '没有找到匹配的书签' : '还没有书签'}
                        </h3>
                        <p className="max-w-xl text-sm text-muted-foreground">
                          {hasActiveFilters
                            ? `当前筛选：${activeFilterLabel}。尝试调整条件或直接清空筛选。`
                            : '开始添加您的第一个书签，建立属于自己的知识体系。'}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                          {hasActiveFilters && (
                            <Button variant="outline" onClick={handleResetFilters}>
                              清空筛选
                            </Button>
                          )}
                          <Button size="lg" className="gap-2" onClick={() => handleOpenDialog()}>
                            <Plus className="h-5 w-5" />
                            {hasActiveFilters ? '添加书签' : '添加第一个书签'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60">
                        <table className="w-full text-sm table-fixed">
                          <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px]">
                            <tr>
                                <th className="px-1.5 py-2 w-10">
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
                                <th className="px-1.5 py-2 text-left w-[60%]">书签</th>
                                <th className="px-1.5 py-2 text-right w-[25%]">数据</th>
                                <th className="px-1.5 py-2 w-24 text-center">操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.bookmarks.map(bookmark => (
                                <tr
                                  key={bookmark.id}
                                  className="group border-t text-sm hover:bg-muted/30 transition-colors"
                                >
                                  <td className={`px-1.5 ${cellPadding} align-top`}>
                                    <input
                                      type="checkbox"
                                      className="accent-primary"
                                      checked={selectedIds.includes(bookmark.id)}
                                      onChange={() => toggleSelection(bookmark.id)}
                                    />
                                  </td>
                                  <td className={`px-1.5 ${cellPadding} align-top`}>
                                    <div className={titleSpacing}>
                                      <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-foreground hover:text-primary line-clamp-1 flex items-center gap-1"
                                        onClick={() => handleVisit(bookmark.id)}
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="truncate">
                                          {highlightTerm ? highlightText(bookmark.title) : bookmark.title}
                                        </span>
                                      </a>
                                      <p className={`${metaTextSize} text-muted-foreground line-clamp-2`}>
                                        {highlightTerm && bookmark.description
                                          ? highlightText(bookmark.description)
                                          : bookmark.description || '暂无描述'}
                                      </p>
                                      <div className={`flex flex-wrap items-center gap-3 ${metaTextSize} text-muted-foreground whitespace-nowrap`}>
                                        <span className="flex items-center gap-1 min-w-[120px]">
                                          <FolderIcon className="h-3 w-3" />
                                          <span className="truncate">
                                            {bookmark.folder?.name ?? '根目录'}
                                          </span>
                                        </span>
                                        <span className="flex items-center gap-1 min-w-[140px]">
                                          <Tag className="h-3 w-3" />
                                          <span className="truncate">
                                            {bookmark.tags && bookmark.tags.length > 0
                                              ? (() => {
                                                  const tagNames = bookmark.tags.map(bt => bt.tag.name);
                                                  const display = tagNames.slice(0, 2).join('、');
                                                  const extra = tagNames.length - Math.min(tagNames.length, 2);
                                                  return `${display}${extra > 0 ? ` +${extra}` : ''}`;
                                                })()
                                              : '未打标签'}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`px-1.5 ${cellPadding} align-top text-right`}>
                                      <div className="inline-flex flex-col items-end text-slate-600 gap-1 text-xs">
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-base font-semibold text-foreground">
                                          {bookmark.visitCount}
                                        </span>
                                        <span>次访问</span>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">最近</p>
                                        <p>
                                          {bookmark.lastVisitedAt
                                            ? new Date(bookmark.lastVisitedAt).toLocaleString('zh-CN')
                                            : '—'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`px-1.5 ${cellPadding} align-top text-center`}>
                                    <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
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
                  </section>
                </div>

                <aside className="space-y-6">
                  {/* 可折叠访问统计 */}
                  <section className="rounded-2xl border border-slate-200/70 bg-white/75 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">访问洞察</h2>
                        <p className="text-sm text-muted-foreground">
                          热门与最近访问在此切换，保持与头部仪表盘的连续感
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex rounded-full border border-slate-200 bg-white/80 p-1 text-sm dark:border-slate-700 dark:bg-slate-900">
                          {(['top', 'recent'] as const).map(key => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setStatsTab(key)}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => setStatsCollapsed(prev => !prev)}
                        >
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
                    <Button variant="outline" className="w-full gap-2" onClick={() => setImportDialogOpen(true)}>
                      <Upload className="h-4 w-4" />
                      快速导入书签
                    </Button>
                  </section>
                </aside>
              </div>
            </div>
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
