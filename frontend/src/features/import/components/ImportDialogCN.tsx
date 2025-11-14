import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { importApi, type ImportResult } from '../api/importApi';
import { useQueryClient } from '@tanstack/react-query';

interface ImportDialogCNProps {
  open: boolean;
  onClose: () => void;
}

export const ImportDialogCN: React.FC<ImportDialogCNProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const content = await file.text();

      let importResult: ImportResult;

      if (file.name.endsWith('.json')) {
        // JSON格式
        const bookmarks = JSON.parse(content);
        importResult = await importApi.importJSON(Array.isArray(bookmarks) ? bookmarks : [bookmarks]);
      } else {
        // HTML格式 (浏览器导出的书签)
        importResult = await importApi.importHTML(content);
      }

      setResult(importResult);

      // 刷新书签列表
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    } catch (error) {
      console.error('导入失败:', error);
      setResult({
        message: '导入失败',
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : '未知错误'],
      });
    } finally {
      setImporting(false);
    }
  }, [file, queryClient]);

  const handleClose = useCallback(() => {
    setFile(null);
    setResult(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>导入书签</DialogTitle>
          <DialogDescription>
            支持导入浏览器导出的HTML书签文件或JSON格式的书签数据
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!result ? (
            <>
              {/* 文件选择 */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="import-file"
                  className="hidden"
                  accept=".html,.json"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
                <label
                  htmlFor="import-file"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {file ? file.name : '选择文件'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      支持 .html 和 .json 文件
                    </p>
                  </div>
                </label>
              </div>

              {/* 说明 */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>HTML格式：</strong>从浏览器（Chrome、Firefox、Edge等）导出的书签文件
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>JSON格式：</strong>自定义的JSON书签数据
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* 导入结果 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">成功导入 {result.imported} 个书签</p>
                    {result.skipped > 0 && (
                      <p className="text-sm text-muted-foreground">跳过 {result.skipped} 个</p>
                    )}
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <div className="flex items-start gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive mb-2">
                          导入过程中遇到 {result.errors.length} 个错误
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {result.errors.slice(0, 5).map((error, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              • {error}
                            </p>
                          ))}
                          {result.errors.length > 5 && (
                            <p className="text-sm text-muted-foreground italic">
                              ... 还有 {result.errors.length - 5} 个错误
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={importing}>
                取消
              </Button>
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? '导入中...' : '开始导入'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>关闭</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
