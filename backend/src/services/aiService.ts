import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { FolderRepository } from '../repositories/FolderRepository';
import { TagRepository } from '../repositories/TagRepository';

export interface AiSuggestion {
  bookmarkId: number;
  recommendedFolder?: string | null;
  recommendedTags?: string[];
  reason?: string;
}

const DEFAULT_MODEL = 'deepseek-chat';
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export class AiService {
  constructor(
    private bookmarkRepo: BookmarkRepository,
    private folderRepo: FolderRepository,
    private tagRepo: TagRepository
  ) {}

  async generateOrganizeSuggestions(bookmarkIds?: number[], profile?: string): Promise<AiSuggestion[]> {
    const bookmarks = bookmarkIds && bookmarkIds.length > 0
      ? await this.bookmarkRepo.findByIds(bookmarkIds)
      : await this.bookmarkRepo.findRecent(10);

    if (!bookmarks.length) {
      return [];
    }

    const folders = await this.folderRepo.findAll();
    const tags = await this.tagRepo.findAll();

    const prompt = this.buildPrompt(bookmarks, folders, tags, profile);
    const response = await this.callDeepSeek(prompt);
    return this.parseResponse(response);
  }

  private buildPrompt(bookmarks: any[], folders: any[], tags: any[], profile?: string): string {
    const folderDescriptions = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      tip:
        folder.parentId === null
          ? '一级目录'
          : `属于 ${folders.find((f: any) => f.id === folder.parentId)?.name ?? '未知'} 的二级目录`,
    }));

    const rootCount = folders.filter(folder => folder.parentId === null).length;
    const childCounts = folders
      .filter(folder => folder.parentId === null)
      .map(folder => ({
        root: folder.name,
        childCount: folders.filter(f => f.parentId === folder.id).length,
      }));

    return `
You are an expert bookmark organizer who can create new categories for different professions.
Based on the user's profile and the existing folders/tags, suggest the most relevant folder
and up to 3 tags for each bookmark. You may reuse existing names or propose concise new names
if the current structure does not fit. Always ensure suggestions align with the user's background.

Constraints:
- Max 5 root folders (parentId null), max 20 subfolders under each root.
- Total number of tags cannot exceed 50.
- If limits are close to the cap, prefer reusing existing items; otherwise new concise names are encouraged.
${profile ? `User profile / preferences: ${profile}` : 'User profile: 未提供'}

Current folder structure hints: ${JSON.stringify(folderDescriptions)}
Current root folder count: ${rootCount}, child counts per root: ${JSON.stringify(childCounts)}
Existing tags: ${JSON.stringify(tags.map(t => t.name))}

Return ONLY valid JSON array with the following structure:
[
  {
    "bookmarkId": 1,
    "recommendedFolder": "学习资料/前端实战",
    "recommendedTags": ["React", "学习"],
    "reason": "简短说明（说明为何放入该目录/标签）"
  }
]

Bookmarks to organize:
${JSON.stringify(
      bookmarks.map(b => ({
        id: b.id,
        title: b.title,
        url: b.url,
        description: b.description,
        folder: b.folder?.name ?? null,
        tags: b.tags?.map((t: any) => t.tag.name) ?? [],
        visitCount: b.visitCount,
        lastVisitedAt: b.lastVisitedAt,
      }))
    )}
`.trim();
  }

  private async callDeepSeek(prompt: string): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY || '';
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that returns concise JSON suggestions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DeepSeek API error: ${text}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content ?? '[]';
  }

  private parseResponse(content: string): AiSuggestion[] {
    const cleaned = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          bookmarkId: Number(item.bookmarkId),
          recommendedFolder: item.recommendedFolder ?? null,
          recommendedTags: Array.isArray(item.recommendedTags) ? item.recommendedTags : [],
          reason: item.reason,
        }));
      }
    } catch (error) {
      console.error('Failed to parse AI response', error, cleaned);
    }
    throw new Error('无法解析 AI 返回的数据，请稍后重试');
  }
}
