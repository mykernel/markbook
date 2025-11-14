import { lazy } from 'react';
import { createFileRoute } from '@tanstack/react-router';

const BookmarkPageCN = lazy(() => import('@/features/bookmarks/components/BookmarkPageCN'));

export const Route = createFileRoute('/')({
  component: () => <BookmarkPageCN />,
});
