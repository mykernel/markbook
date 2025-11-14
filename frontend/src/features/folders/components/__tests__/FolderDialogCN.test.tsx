import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FolderDialogCN } from '../FolderDialogCN';
import { folderApi } from '@/features/folders/api/folderApi';

vi.mock('@/features/folders/api/folderApi', () => ({
  folderApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

const createWrapper = (queryClient: QueryClient, children: React.ReactNode) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('FolderDialogCN', () => {
  const baseFolder = {
    id: 42,
    name: '测试文件夹',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [],
  };

  const allFolders = [baseFolder];

  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button when editing existing folder and calls API on confirm', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    const onClose = vi.fn();
    const queryClient = new QueryClient();

    render(
      createWrapper(
        queryClient,
        <FolderDialogCN
          open
          onClose={onClose}
          folder={baseFolder as any}
          folders={allFolders as any}
          onDeleted={onDeleted}
        />
      )
    );

    const deleteButton = screen.getByRole('button', { name: /删除文件夹/i });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    await waitFor(() => {
      expect(folderApi.delete).toHaveBeenCalledWith(baseFolder.id);
      expect(onDeleted).toHaveBeenCalledWith(baseFolder.id);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not delete when user cancels confirm', async () => {
    (window.confirm as any).mockReturnValueOnce(false);
    const user = userEvent.setup();
    const queryClient = new QueryClient();

    render(
      createWrapper(
        queryClient,
        <FolderDialogCN
          open
          onClose={vi.fn()}
          folder={baseFolder as any}
          folders={allFolders as any}
        />
      )
    );

    const deleteButton = screen.getByRole('button', { name: /删除文件夹/i });
    await user.click(deleteButton);

    expect(folderApi.delete).not.toHaveBeenCalled();
  });
});
