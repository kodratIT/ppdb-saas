import { z } from 'zod';

export const scoreInputSchema = z.object({
	score: z
		.number()
		.int('Score must be an integer')
		.min(0, 'Score must be at least 0')
		.max(100, 'Score must be at most 100'),
	notes: z
		.string()
		.trim()
		.max(2000, 'Notes must be 2000 characters or less')
		.optional()
		.or(z.literal('')),
	finalize: z.boolean().optional().default(false)
});

export const unlockScoreSchema = z.object({
	reason: z
		.string()
		.trim()
		.min(10, 'Unlock reason must be at least 10 characters')
		.max(500, 'Unlock reason must be 500 characters or less')
});

export type ScoreInput = z.infer<typeof scoreInputSchema>;
export type UnlockScoreInput = z.infer<typeof unlockScoreSchema>;
