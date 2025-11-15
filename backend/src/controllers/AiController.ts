import { Request, Response } from 'express';
import { BaseController } from '../utils/BaseController';
import { AiService } from '../services/aiService';
import { z } from 'zod';

const organizeSchema = z.object({
  bookmarkIds: z.array(z.number().int().positive()).optional(),
  profile: z.string().max(200).optional(),
});

export class AiController extends BaseController {
  constructor(private aiService: AiService) {
    super();
  }

  generateOrganizeSuggestions = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = organizeSchema.parse(req.body ?? {});
    const suggestions = await this.aiService.generateOrganizeSuggestions(
      validated.bookmarkIds,
      validated.profile
    );
    this.handleSuccess(res, { suggestions });
  });
}
