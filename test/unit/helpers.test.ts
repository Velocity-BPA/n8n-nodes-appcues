/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	cleanObject,
	formatDateRange,
	parseUserIds,
	formatNpsCategory,
	calculateNps,
	isValidFlowState,
	isValidSegmentType,
	isValidJobStatus,
	buildProfileObject,
	buildEventObject,
	mergeProperties,
} from '../../nodes/Appcues/utils/helpers';

describe('Appcues Helpers', () => {
	describe('cleanObject', () => {
		it('should remove undefined and null values', () => {
			const input = {
				name: 'test',
				value: undefined,
				count: null,
				active: true,
			};
			const result = cleanObject(input);
			expect(result).toEqual({ name: 'test', active: true });
		});

		it('should keep zero and false values', () => {
			const input = {
				count: 0,
				active: false,
				name: 'test',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ count: 0, active: false, name: 'test' });
		});

		it('should handle empty object', () => {
			const result = cleanObject({});
			expect(result).toEqual({});
		});

		it('should remove empty strings', () => {
			const input = {
				name: '',
				value: 'test',
			};
			const result = cleanObject(input);
			expect(result).toEqual({ value: 'test' });
		});
	});

	describe('formatDateRange', () => {
		it('should format date range with both dates', () => {
			const result = formatDateRange('2024-01-01', '2024-12-31');
			expect(result.from).toBeDefined();
			expect(result.to).toBeDefined();
		});

		it('should handle only start date', () => {
			const result = formatDateRange('2024-01-01', undefined);
			expect(result.from).toBeDefined();
			expect(result.to).toBeUndefined();
		});

		it('should handle only end date', () => {
			const result = formatDateRange(undefined, '2024-12-31');
			expect(result.from).toBeUndefined();
			expect(result.to).toBeDefined();
		});

		it('should handle no dates', () => {
			const result = formatDateRange(undefined, undefined);
			expect(result).toEqual({});
		});
	});

	describe('parseUserIds', () => {
		it('should parse comma-separated string', () => {
			const result = parseUserIds('user1, user2, user3');
			expect(result).toEqual(['user1', 'user2', 'user3']);
		});

		it('should handle array input', () => {
			const result = parseUserIds(['user1', 'user2']);
			expect(result).toEqual(['user1', 'user2']);
		});

		it('should trim whitespace', () => {
			const result = parseUserIds('  user1  ,  user2  ');
			expect(result).toEqual(['user1', 'user2']);
		});

		it('should filter empty strings', () => {
			const result = parseUserIds('user1,,user2,');
			expect(result).toEqual(['user1', 'user2']);
		});
	});

	describe('formatNpsCategory', () => {
		it('should categorize promoters (9-10)', () => {
			expect(formatNpsCategory(9)).toBe('Promoter');
			expect(formatNpsCategory(10)).toBe('Promoter');
		});

		it('should categorize passives (7-8)', () => {
			expect(formatNpsCategory(7)).toBe('Passive');
			expect(formatNpsCategory(8)).toBe('Passive');
		});

		it('should categorize detractors (0-6)', () => {
			expect(formatNpsCategory(0)).toBe('Detractor');
			expect(formatNpsCategory(6)).toBe('Detractor');
		});
	});

	describe('calculateNps', () => {
		it('should calculate NPS score correctly', () => {
			const responses = [
				{ score: 10 },
				{ score: 9 },
				{ score: 8 },
				{ score: 7 },
				{ score: 5 },
			];
			// 2 promoters (40%), 2 passives, 1 detractor (20%)
			// NPS = 40 - 20 = 20
			const result = calculateNps(responses);
			expect(result).toBe(20);
		});

		it('should handle all promoters', () => {
			const responses = [{ score: 10 }, { score: 9 }, { score: 10 }];
			const result = calculateNps(responses);
			expect(result).toBe(100);
		});

		it('should handle all detractors', () => {
			const responses = [{ score: 0 }, { score: 3 }, { score: 6 }];
			const result = calculateNps(responses);
			expect(result).toBe(-100);
		});

		it('should return 0 for empty array', () => {
			const result = calculateNps([]);
			expect(result).toBe(0);
		});
	});

	describe('isValidFlowState', () => {
		it('should validate correct flow states', () => {
			expect(isValidFlowState('published')).toBe(true);
			expect(isValidFlowState('draft')).toBe(true);
			expect(isValidFlowState('disabled')).toBe(true);
		});

		it('should reject invalid flow states', () => {
			expect(isValidFlowState('invalid')).toBe(false);
			expect(isValidFlowState('')).toBe(false);
		});
	});

	describe('isValidSegmentType', () => {
		it('should validate correct segment types', () => {
			expect(isValidSegmentType('static')).toBe(true);
			expect(isValidSegmentType('dynamic')).toBe(true);
		});

		it('should reject invalid segment types', () => {
			expect(isValidSegmentType('invalid')).toBe(false);
			expect(isValidSegmentType('')).toBe(false);
		});
	});

	describe('isValidJobStatus', () => {
		it('should validate correct job statuses', () => {
			expect(isValidJobStatus('pending')).toBe(true);
			expect(isValidJobStatus('processing')).toBe(true);
			expect(isValidJobStatus('completed')).toBe(true);
			expect(isValidJobStatus('failed')).toBe(true);
		});

		it('should reject invalid job statuses', () => {
			expect(isValidJobStatus('invalid')).toBe(false);
			expect(isValidJobStatus('')).toBe(false);
		});
	});

	describe('buildProfileObject', () => {
		it('should build profile with user_id and properties', () => {
			const result = buildProfileObject('user123', { name: 'John', plan: 'pro' });
			expect(result).toEqual({
				user_id: 'user123',
				properties: { name: 'John', plan: 'pro' },
			});
		});

		it('should handle empty properties', () => {
			const result = buildProfileObject('user123', {});
			expect(result).toEqual({ user_id: 'user123' });
		});
	});

	describe('buildEventObject', () => {
		it('should build event with name and user_id', () => {
			const result = buildEventObject('button_clicked', 'user123');
			expect(result).toEqual({
				name: 'button_clicked',
				user_id: 'user123',
			});
		});

		it('should include attributes when provided', () => {
			const result = buildEventObject('button_clicked', 'user123', { button: 'submit' });
			expect(result).toEqual({
				name: 'button_clicked',
				user_id: 'user123',
				attributes: { button: 'submit' },
			});
		});

		it('should include timestamp when provided', () => {
			const result = buildEventObject('button_clicked', 'user123', undefined, '2024-01-01T00:00:00Z');
			expect(result).toEqual({
				name: 'button_clicked',
				user_id: 'user123',
				timestamp: '2024-01-01T00:00:00Z',
			});
		});
	});

	describe('mergeProperties', () => {
		it('should merge updates with existing data', () => {
			const result = mergeProperties({ name: 'John' }, { plan: 'pro' });
			expect(result).toEqual({ name: 'John', plan: 'pro' });
		});

		it('should return updates when existing is undefined', () => {
			const result = mergeProperties(undefined, { plan: 'pro' });
			expect(result).toEqual({ plan: 'pro' });
		});

		it('should override existing properties with updates', () => {
			const result = mergeProperties({ name: 'John', plan: 'free' }, { plan: 'pro' });
			expect(result).toEqual({ name: 'John', plan: 'pro' });
		});
	});
});
