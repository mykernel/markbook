import React from 'react';
import { ExternalLink, Edit, Folder as FolderIcon, Tag, Trash2 } from 'lucide-react';
import type { Bookmark as BookmarkType } from '~types';
import { Button } from '@/components/ui/button';

interface BookmarkTableRowProps {
  bookmark: BookmarkType;
  selected: boolean;
  cellPaddingClass: string;
  metaTextClass: string;
  highlightTitle: (text: string) => React.ReactNode;
  highlightDescription?: (text: string) => React.ReactNode;
  onToggleSelect: (id: number) => void;
  onVisit: (id: number) => void;
  onEdit: (bookmark: BookmarkType) => void;
  onDelete: (id: number, title: string) => void;
  dataCell?: React.ReactNode;
}

export const BookmarkTableRow: React.FC<BookmarkTableRowProps> = ({
  bookmark,
  selected,
  cellPaddingClass,
  metaTextClass,
  highlightTitle,
  highlightDescription,
  onToggleSelect,
  onVisit,
  onEdit,
  onDelete,
  dataCell,
}) => {
  const tagsSummary = () => {
    if (!bookmark.tags || bookmark.tags.length === 0) {
      return '未打标签';
    }
    const tagNames = bookmark.tags.map(bt => bt.tag.name);
    const display = tagNames.slice(0, 2).join('、');
    const extra = tagNames.length > 2 ? ` +${tagNames.length - 2}` : '';
    return `${display}${extra}`;
  };

  return (
    <tr className="group border-t text-sm hover:bg-muted/30 transition-colors">
      <td className={`px-1.5 ${cellPaddingClass} align-top`}>
        <input
          type="checkbox"
          className="accent-primary"
          checked={selected}
          onChange={() => onToggleSelect(bookmark.id)}
        />
      </td>
      <td className={`px-1.5 ${cellPaddingClass} align-top`}>
        <div className="space-y-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary line-clamp-1 flex items-center gap-1"
            onClick={() => onVisit(bookmark.id)}
          >
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{highlightTitle(bookmark.title)}</span>
          </a>
          <p className={`${metaTextClass} text-muted-foreground line-clamp-2`}>
            {bookmark.description
              ? highlightDescription
                ? highlightDescription(bookmark.description)
                : bookmark.description
              : '暂无描述'}
          </p>
          <div className={`flex flex-wrap items-center gap-3 ${metaTextClass} text-muted-foreground whitespace-nowrap`}>
            <span className="flex items-center gap-1 min-w-[120px]">
              <FolderIcon className="h-3 w-3" />
              <span className="truncate">{bookmark.folder?.name ?? '根目录'}</span>
            </span>
            <span className="flex items-center gap-1 min-w-[140px]">
              <Tag className="h-3 w-3" />
              <span className="truncate">{tagsSummary()}</span>
            </span>
          </div>
        </div>
      </td>
      <td className={`px-1.5 ${cellPaddingClass} align-top text-right`}>
        {dataCell}
      </td>
      <td className={`px-1.5 ${cellPaddingClass} align-top text-center`}>
        <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(bookmark)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(bookmark.id, bookmark.title)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default BookmarkTableRow;
