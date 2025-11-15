import { TagRepository } from '../repositories/TagRepository';
import type { CreateTagInput, UpdateTagInput } from '../validators/tagValidator';

export class TagService {
  constructor(private tagRepo: TagRepository) {}

  async getAllTags() {
    return this.tagRepo.findAll();
  }

  async getTagById(id: number) {
    const tag = await this.tagRepo.findById(id);
    if (!tag) {
      throw new Error('Tag not found');
    }
    return tag;
  }

  async createTag(input: CreateTagInput) {
    const existing = await this.tagRepo.findByName(input.name);
    if (existing) {
      throw new Error('Tag with this name already exists');
    }
    const total = await this.tagRepo.count();
    if (total >= 50) {
      throw new Error('标签数量已达上限（50 个），请先清理不需要的标签');
    }
    return this.tagRepo.create(input);
  }

  async updateTag(id: number, input: UpdateTagInput) {
    const existing = await this.tagRepo.findById(id);
    if (!existing) {
      throw new Error('Tag not found');
    }

    if (input.name) {
      const nameConflict = await this.tagRepo.findByName(input.name);
      if (nameConflict && nameConflict.id !== id) {
        throw new Error('Tag with this name already exists');
      }
    }

    return this.tagRepo.update(id, input);
  }

  async deleteTag(id: number) {
    const existing = await this.tagRepo.findById(id);
    if (!existing) {
      throw new Error('Tag not found');
    }
    return this.tagRepo.delete(id);
  }
}
