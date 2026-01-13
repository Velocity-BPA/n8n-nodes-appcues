/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Appcues } from '../../nodes/Appcues/Appcues.node';
import { AppcuesTrigger } from '../../nodes/Appcues/AppcuesTrigger.node';
import { AppcuesApi } from '../../credentials/AppcuesApi.credentials';

describe('Appcues Node Integration', () => {
	describe('Appcues Node', () => {
		let node: Appcues;

		beforeEach(() => {
			node = new Appcues();
		});

		it('should have correct node properties', () => {
			expect(node.description.displayName).toBe('Appcues');
			expect(node.description.name).toBe('appcues');
			expect(node.description.group).toContain('transform');
			expect(node.description.version).toBe(1);
		});

		it('should have all resources defined', () => {
			const resourceOptions = node.description.properties.find(
				(p) => p.name === 'resource'
			);
			expect(resourceOptions).toBeDefined();
			
			const options = resourceOptions?.options as Array<{ value: string }>;
			const resourceValues = options?.map((o) => o.value) || [];
			
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('group');
			expect(resourceValues).toContain('flow');
			expect(resourceValues).toContain('segment');
			expect(resourceValues).toContain('checklist');
			expect(resourceValues).toContain('nps');
			expect(resourceValues).toContain('job');
		});

		it('should require Appcues API credentials', () => {
			expect(node.description.credentials).toContainEqual(
				expect.objectContaining({
					name: 'appcuesApi',
					required: true,
				})
			);
		});

		it('should have correct icon', () => {
			expect(node.description.icon).toBe('file:appcues.svg');
		});
	});

	describe('AppcuesTrigger Node', () => {
		let triggerNode: AppcuesTrigger;

		beforeEach(() => {
			triggerNode = new AppcuesTrigger();
		});

		it('should have correct trigger properties', () => {
			expect(triggerNode.description.displayName).toBe('Appcues Trigger');
			expect(triggerNode.description.name).toBe('appcuesTrigger');
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should have webhook configuration', () => {
			expect(triggerNode.description.webhooks).toBeDefined();
			expect(triggerNode.description.webhooks?.length).toBeGreaterThan(0);
		});

		it('should have event type options', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'event'
			);
			expect(eventProperty).toBeDefined();
		});
	});

	describe('AppcuesApi Credentials', () => {
		let credentials: AppcuesApi;

		beforeEach(() => {
			credentials = new AppcuesApi();
		});

		it('should have correct credential properties', () => {
			expect(credentials.name).toBe('appcuesApi');
			expect(credentials.displayName).toBe('Appcues API');
		});

		it('should require accountId', () => {
			const accountIdProperty = credentials.properties.find(
				(p) => p.name === 'accountId'
			);
			expect(accountIdProperty).toBeDefined();
			expect(accountIdProperty?.required).toBe(true);
		});

		it('should require apiKey', () => {
			const apiKeyProperty = credentials.properties.find(
				(p) => p.name === 'apiKey'
			);
			expect(apiKeyProperty).toBeDefined();
			expect(apiKeyProperty?.required).toBe(true);
		});

		it('should require apiSecret with password type', () => {
			const apiSecretProperty = credentials.properties.find(
				(p) => p.name === 'apiSecret'
			);
			expect(apiSecretProperty).toBeDefined();
			expect(apiSecretProperty?.required).toBe(true);
			expect(apiSecretProperty?.typeOptions?.password).toBe(true);
		});

		it('should have test configuration', () => {
			expect(credentials.test).toBeDefined();
		});
	});
});
