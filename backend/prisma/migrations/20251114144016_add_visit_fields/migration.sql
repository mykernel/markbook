-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bookmark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "favicon" TEXT,
    "folderId" INTEGER,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisitedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bookmark_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Bookmark" ("createdAt", "description", "favicon", "folderId", "id", "title", "updatedAt", "url") SELECT "createdAt", "description", "favicon", "folderId", "id", "title", "updatedAt", "url" FROM "Bookmark";
DROP TABLE "Bookmark";
ALTER TABLE "new_Bookmark" RENAME TO "Bookmark";
CREATE INDEX "Bookmark_folderId_idx" ON "Bookmark"("folderId");
CREATE INDEX "Bookmark_title_idx" ON "Bookmark"("title");
CREATE INDEX "Bookmark_url_idx" ON "Bookmark"("url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
