import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Folder, FolderOpen, Home, Plus, MoreVertical } from 'lucide-react';
import { folderApi } from '@/features/folders/api/folderApi';
import { tagApi } from '@/features/tags/api/tagApi';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Folder as FolderType } from '~types';

interface SidebarProps {
  selectedFolderId?: number | null;
  selectedTag?: string | null;
  onFolderSelect: (folderId: number | null) => void;
  onTagSelect: (tagName: string | null) => void;
  onAddFolder: () => void;
  onEditFolder: (folder: FolderType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedFolderId,
  selectedTag = null,
  onFolderSelect,
  onTagSelect,
  onAddFolder,
  onEditFolder,
}) => {
  const { data: folders } = useSuspenseQuery({
    queryKey: ['folders'],
    queryFn: () => folderApi.getAll(),
  });

  const { data: tags } = useSuspenseQuery({
    queryKey: ['tags'],
    queryFn: () => tagApi.getAll(),
  });
  const availableTags = (tags || []).filter(tag => (tag._count?.bookmarks ?? 0) > 0);

  // 构建文件夹树
  const buildFolderTree = (allFolders: FolderType[], parentId: number | null = null): FolderType[] => {
    return allFolders
      .filter(f => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const children = buildFolderTree(folders || [], folder.id);
    const hasChildren = children.length > 0;

    return (
      <div key={folder.id} className="group">
        <div className="flex items-center">
          <button
            onClick={() => onFolderSelect(folder.id)}
            className={`flex-1 text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-accent transition-colors ${
              isSelected ? 'bg-accent font-medium' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren ? (
              <FolderOpen className="h-4 w-4 text-yellow-600" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-600" />
            )}
            <span className="flex-1 truncate">{folder.name}</span>
            {folder._count?.bookmarks !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {folder._count.bookmarks}
              </Badge>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(event) => {
              event.stopPropagation();
              onEditFolder(folder);
            }}
            title="编辑文件夹"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        {hasChildren && (
          <div className="mt-1">
            {children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = buildFolderTree(folders || [], null);

  return (
    <div className="w-64 h-screen bg-background border-r border-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* 全部书签 */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">导航</h3>
          <button
            onClick={() => onFolderSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-accent transition-colors ${
              selectedFolderId === null ? 'bg-accent font-medium' : ''
            }`}
          >
            <Home className="h-4 w-4" />
            <span>全部书签</span>
          </button>
        </div>

        {/* 文件夹 */}
        <div>
          <div className="flex items-center justify-between mb-2 px-3">
            <h3 className="text-sm font-semibold text-muted-foreground">文件夹</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onAddFolder}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {rootFolders.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                暂无文件夹
              </div>
            ) : (
              rootFolders.map(folder => renderFolder(folder))
            )}
          </div>
        </div>

        {/* 标签 */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">标签</h3>
          <div className="space-y-1 px-3">
            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => {
                  const isSelected = selectedTag === tag.name;
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? 'default' : 'secondary'}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: isSelected && tag.color ? tag.color : undefined,
                      }}
                      onClick={() => onTagSelect(isSelected ? null : tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">暂无标签</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
