import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as admissionPathsDomain from '../../src/lib/server/domain/admission-paths';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../src/lib/server/db/schema';

// Mock database
const createMockDb = () => {
	const mockDb = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis()
	};
	return mockDb as unknown as NeonHttpDatabase<typeof schema>;
};

describe('Admission Paths Domain Logic', () => {
	let mockDb: NeonHttpDatabase<typeof schema>;

	beforeEach(() => {
		mockDb = createMockDb();
		vi.clearAllMocks();
	});

	describe('listAdmissionPaths', () => {
		it('should return all admission paths for a tenant', async () => {
			const tenantId = 'tenant-123';
			const mockPaths = [
				{
					id: 'path-1',
					tenantId,
					name: 'Jalur Prestasi',
					description: 'Achievement-based admission',
					quota: 50,
					filledSlots: 20,
					status: 'open' as const,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					id: 'path-2',
					tenantId,
					name: 'Jalur Zonasi',
					description: 'Zone-based admission',
					quota: 100,
					filledSlots: 0,
					status: 'draft' as const,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(mockPaths)
				})
			} as any);

			const result = await admissionPathsDomain.listAdmissionPaths(mockDb, tenantId);

			expect(result).toEqual(mockPaths);
			expect(result).toHaveLength(2);
		});

		it('should return empty array when no paths exist', async () => {
			const tenantId = 'tenant-empty';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await admissionPathsDomain.listAdmissionPaths(mockDb, tenantId);

			expect(result).toEqual([]);
		});
	});

	describe('getAdmissionPathById', () => {
		it('should return admission path by id for valid tenant', async () => {
			const tenantId = 'tenant-123';
			const pathId = 'path-1';
			const mockPath = {
				id: pathId,
				tenantId,
				name: 'Jalur Prestasi',
				description: 'Achievement-based',
				quota: 50,
				filledSlots: 20,
				status: 'open' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockPath])
				})
			} as any);

			const result = await admissionPathsDomain.getAdmissionPathById(mockDb, tenantId, pathId);

			expect(result).toEqual(mockPath);
		});

		it('should return null when path does not exist', async () => {
			const tenantId = 'tenant-123';
			const pathId = 'non-existent';

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

			const result = await admissionPathsDomain.getAdmissionPathById(mockDb, tenantId, pathId);

			expect(result).toBeNull();
		});
	});

	describe('createAdmissionPath', () => {
		it('should create new admission path with draft status', async () => {
			const tenantId = 'tenant-123';
			const createData = {
				name: 'Jalur Afirmasi',
				description: 'Affirmative action path',
				quota: 30,
				status: 'draft' as const
			};

			const createdPath = {
				id: 'path-new',
				tenantId,
				...createData,
				filledSlots: 0,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'insert').mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([createdPath])
				})
			} as any);

			const result = await admissionPathsDomain.createAdmissionPath(mockDb, tenantId, createData);

			expect(result).toEqual(createdPath);
			expect(result.status).toBe('draft');
			expect(result.filledSlots).toBe(0);
		});

		it('should throw error when creating with invalid quota', async () => {
			const tenantId = 'tenant-123';
			const invalidData = {
				name: 'Invalid Path',
				quota: -10, // Invalid: negative quota
				status: 'draft' as const
			};

			await expect(
				admissionPathsDomain.createAdmissionPath(mockDb, tenantId, invalidData)
			).rejects.toThrow();
		});
	});

	describe('updateAdmissionPath', () => {
		it('should update admission path fields', async () => {
			const tenantId = 'tenant-123';
			const pathId = 'path-1';
			const updateData = {
				name: 'Updated Path Name',
				quota: 60
			};

			const currentPath = {
				id: pathId,
				tenantId,
				name: 'Original Name',
				description: 'Original description',
				quota: 50,
				filledSlots: 20,
				status: 'open' as const,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const updatedPath = {
				...currentPath,
				name: updateData.name,
				quota: updateData.quota
			};

			// Mock getting current path for quota validation
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([currentPath])
				})
			} as any);

			vi.spyOn(mockDb, 'update').mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedPath])
					})
				})
			} as any);

			const result = await admissionPathsDomain.updateAdmissionPath(
				mockDb,
				tenantId,
				pathId,
				updateData
			);

			expect(result).toEqual(updatedPath);
			expect(result.name).toBe('Updated Path Name');
		});

		it('should throw error when reducing quota below filled slots', async () => {
			const tenantId = 'tenant-123';
			const pathId = 'path-1';
			const mockPath = {
				id: pathId,
				tenantId,
				name: 'Path',
				quota: 50,
				filledSlots: 30,
				status: 'open' as const,
				description: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock getting current path
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockPath])
				})
			} as any);

			await expect(
				admissionPathsDomain.updateAdmissionPath(mockDb, tenantId, pathId, { quota: 20 })
			).rejects.toThrow('Cannot reduce quota below current filled slots');
		});
	});

	describe('deleteAdmissionPath', () => {
		it('should delete admission path when filled slots is 0', async () => {
			const tenantId = 'tenant-123';
			const pathId = 'path-1';
			const mockPath = {
				id: pathId,
				tenantId,
				name: 'Path',
				quota: 50,
				filledSlots: 0,
				status: 'draft' as const,
				description: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock getting current path
			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockPath])
				})
			} as any);

			// Mock delete
			vi.spyOn(mockDb, 'delete').mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined)
			} as any);

			await admissionPathsDomain.deleteAdmissionPath(mockDb, tenantId, pathId);

			expect(mockDb.delete).toHaveBeenCalled();
		});

		it('should throw error when trying to delete path with filled slots', async () => {
			const tenantId = 'tenant-123';
			const pathId = 'path-1';
			const mockPath = {
				id: pathId,
				tenantId,
				name: 'Path',
				quota: 50,
				filledSlots: 10,
				status: 'open' as const,
				description: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			vi.spyOn(mockDb, 'select').mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([mockPath])
				})
			} as any);

			await expect(
				admissionPathsDomain.deleteAdmissionPath(mockDb, tenantId, pathId)
			).rejects.toThrow('Cannot delete admission path with filled slots');
		});
	});

	describe('Lifecycle Transitions', () => {
		describe('publishPath (draft → open)', () => {
			it('should transition from draft to open', async () => {
				const tenantId = 'tenant-123';
				const pathId = 'path-1';
				const mockPath = {
					id: pathId,
					tenantId,
					name: 'Path',
					quota: 50,
					filledSlots: 0,
					status: 'draft' as const,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const publishedPath = { ...mockPath, status: 'open' as const };

				// Mock getting current path
				vi.spyOn(mockDb, 'select').mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([mockPath])
					})
				} as any);

				// Mock update
				vi.spyOn(mockDb, 'update').mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([publishedPath])
						})
					})
				} as any);

				const result = await admissionPathsDomain.publishPath(mockDb, tenantId, pathId);

				expect(result.status).toBe('open');
			});

			it('should throw error when trying to publish non-draft path', async () => {
				const tenantId = 'tenant-123';
				const pathId = 'path-1';
				const mockPath = {
					id: pathId,
					tenantId,
					name: 'Path',
					quota: 50,
					filledSlots: 0,
					status: 'open' as const,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				vi.spyOn(mockDb, 'select').mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([mockPath])
					})
				} as any);

				await expect(admissionPathsDomain.publishPath(mockDb, tenantId, pathId)).rejects.toThrow(
					'Invalid status transition'
				);
			});
		});

		describe('closePath (open → closed)', () => {
			it('should transition from open to closed', async () => {
				const tenantId = 'tenant-123';
				const pathId = 'path-1';
				const mockPath = {
					id: pathId,
					tenantId,
					name: 'Path',
					quota: 50,
					filledSlots: 25,
					status: 'open' as const,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const closedPath = { ...mockPath, status: 'closed' as const };

				vi.spyOn(mockDb, 'select').mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([mockPath])
					})
				} as any);

				vi.spyOn(mockDb, 'update').mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([closedPath])
						})
					})
				} as any);

				const result = await admissionPathsDomain.closePath(mockDb, tenantId, pathId);

				expect(result.status).toBe('closed');
			});
		});

		describe('reopenPath (closed → open)', () => {
			it('should transition from closed back to open', async () => {
				const tenantId = 'tenant-123';
				const pathId = 'path-1';
				const mockPath = {
					id: pathId,
					tenantId,
					name: 'Path',
					quota: 50,
					filledSlots: 25,
					status: 'closed' as const,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const reopenedPath = { ...mockPath, status: 'open' as const };

				vi.spyOn(mockDb, 'select').mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([mockPath])
					})
				} as any);

				vi.spyOn(mockDb, 'update').mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([reopenedPath])
						})
					})
				} as any);

				const result = await admissionPathsDomain.reopenPath(mockDb, tenantId, pathId);

				expect(result.status).toBe('open');
			});
		});

		describe('archivePath (closed → archived)', () => {
			it('should transition from closed to archived', async () => {
				const tenantId = 'tenant-123';
				const pathId = 'path-1';
				const mockPath = {
					id: pathId,
					tenantId,
					name: 'Path',
					quota: 50,
					filledSlots: 50,
					status: 'closed' as const,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const archivedPath = { ...mockPath, status: 'archived' as const };

				vi.spyOn(mockDb, 'select').mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([mockPath])
					})
				} as any);

				vi.spyOn(mockDb, 'update').mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([archivedPath])
						})
					})
				} as any);

				const result = await admissionPathsDomain.archivePath(mockDb, tenantId, pathId);

				expect(result.status).toBe('archived');
			});

			it('should throw error when trying to archive from invalid status', async () => {
				const tenantId = 'tenant-123';
				const pathId = 'path-1';
				const mockPath = {
					id: pathId,
					tenantId,
					name: 'Path',
					quota: 50,
					filledSlots: 0,
					status: 'draft' as const,
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				vi.spyOn(mockDb, 'select').mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([mockPath])
					})
				} as any);

				await expect(admissionPathsDomain.archivePath(mockDb, tenantId, pathId)).rejects.toThrow(
					'Invalid status transition'
				);
			});
		});
	});
});
