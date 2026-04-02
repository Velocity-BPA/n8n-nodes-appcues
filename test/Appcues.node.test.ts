/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Appcues } from '../nodes/Appcues/Appcues.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Appcues Node', () => {
  let node: Appcues;

  beforeAll(() => {
    node = new Appcues();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Appcues');
      expect(node.description.name).toBe('appcues');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('User Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        bearerToken: 'test-token', 
        baseUrl: 'https://api.appcues.com' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(), 
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should create a user successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createUser';
        case 'userId': return 'user123';
        case 'properties.property': return [{ key: 'name', value: 'John Doe' }];
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      user_id: 'user123', 
      success: true 
    });

    const items = [{ json: {} }];
    const result = await executeUserOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.user_id).toBe('user123');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.appcues.com/v1/users'
      })
    );
  });

  it('should get a user successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getUser';
        case 'userId': return 'user123';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      user_id: 'user123', 
      properties: { name: 'John Doe' } 
    });

    const items = [{ json: {} }];
    const result = await executeUserOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.user_id).toBe('user123');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.appcues.com/v1/users/user123'
      })
    );
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getUser';
        case 'userId': return 'user123';
        default: return undefined;
      }
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const items = [{ json: {} }];
    const result = await executeUserOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Flow Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				bearerToken: 'test-token',
				baseUrl: 'https://api.appcues.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getAllFlows', () => {
		it('should get all flows successfully', async () => {
			const mockResponse = { flows: [{ id: '1', name: 'Test Flow' }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllFlows')
				.mockReturnValueOnce(25)
				.mockReturnValueOnce(0);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.appcues.com/v1/flows',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				qs: { limit: 25, offset: 0 },
				json: true,
			});
		});

		it('should handle getAllFlows error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllFlows');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getFlow', () => {
		it('should get flow successfully', async () => {
			const mockResponse = { id: '123', name: 'Test Flow' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getFlow')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.appcues.com/v1/flows/123',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});

		it('should handle getFlow error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getFlow');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Flow not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Flow not found' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getFlowStats', () => {
		it('should get flow stats successfully', async () => {
			const mockResponse = { views: 100, completions: 50 };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getFlowStats')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-01-31');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.appcues.com/v1/flows/123/stats',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				qs: { start_date: '2023-01-01', end_date: '2023-01-31' },
				json: true,
			});
		});

		it('should handle getFlowStats error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getFlowStats');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Stats unavailable'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Stats unavailable' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('publishFlow', () => {
		it('should publish flow successfully', async () => {
			const mockResponse = { success: true, message: 'Flow published' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('publishFlow')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.appcues.com/v1/flows/123/publish',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});

		it('should handle publishFlow error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('publishFlow');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Publish failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Publish failed' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('unpublishFlow', () => {
		it('should unpublish flow successfully', async () => {
			const mockResponse = { success: true, message: 'Flow unpublished' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('unpublishFlow')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.appcues.com/v1/flows/123/unpublish',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});

		it('should handle unpublishFlow error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unpublishFlow');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Unpublish failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeFlowOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Unpublish failed' }, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Segment Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				bearerToken: 'test-token',
				baseUrl: 'https://api.appcues.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	it('should get all segments successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllSegments')
			.mockReturnValueOnce(50)
			.mockReturnValueOnce(0);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			segments: [{ id: '1', name: 'Test Segment' }],
		});

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { segments: [{ id: '1', name: 'Test Segment' }] },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should get a specific segment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getSegment')
			.mockReturnValueOnce('segment123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'segment123',
			name: 'Test Segment',
		});

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { id: 'segment123', name: 'Test Segment' },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should create a segment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createSegment')
			.mockReturnValueOnce('New Segment')
			.mockReturnValueOnce({ criteria: 'test' });

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'new123',
			name: 'New Segment',
		});

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { id: 'new123', name: 'New Segment' },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should update a segment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('updateSegment')
			.mockReturnValueOnce('segment123')
			.mockReturnValueOnce('Updated Name')
			.mockReturnValueOnce({ criteria: 'updated' });

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			id: 'segment123',
			name: 'Updated Name',
		});

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { id: 'segment123', name: 'Updated Name' },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should delete a segment successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('deleteSegment')
			.mockReturnValueOnce('segment123');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			success: true,
		});

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { success: true },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should get segment users successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getSegmentUsers')
			.mockReturnValueOnce('segment123')
			.mockReturnValueOnce(50)
			.mockReturnValueOnce(0);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			users: [{ id: 'user1', email: 'test@example.com' }],
		});

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { users: [{ id: 'user1', email: 'test@example.com' }] },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should handle errors when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllSegments');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([
			{
				json: { error: 'API Error' },
				pairedItem: { item: 0 },
			},
		]);
	});

	it('should throw error when continueOnFail is false', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllSegments');
		mockExecuteFunctions.continueOnFail.mockReturnValue(false);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		await expect(
			executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('API Error');
	});
});

describe('Checklist Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.appcues.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getAllChecklists', () => {
		it('should get all checklists successfully', async () => {
			const mockResponse = { checklists: [{ id: '1', name: 'Test Checklist' }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllChecklists')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(0);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeChecklistOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{ json: mockResponse, pairedItem: { item: 0 } },
			]);
		});

		it('should handle error when getting all checklists fails', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllChecklists')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(0);
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
				new Error('API Error'),
			);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeChecklistOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{ json: { error: 'API Error' }, pairedItem: { item: 0 } },
			]);
		});
	});

	describe('getChecklist', () => {
		it('should get a specific checklist successfully', async () => {
			const mockResponse = { id: '123', name: 'Test Checklist' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getChecklist')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeChecklistOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{ json: mockResponse, pairedItem: { item: 0 } },
			]);
		});
	});

	describe('getChecklistStats', () => {
		it('should get checklist stats successfully', async () => {
			const mockResponse = { completion_rate: 0.75, total_users: 100 };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getChecklistStats')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-12-31');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeChecklistOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{ json: mockResponse, pairedItem: { item: 0 } },
			]);
		});
	});

	describe('publishChecklist', () => {
		it('should publish a checklist successfully', async () => {
			const mockResponse = { success: true, message: 'Checklist published' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('publishChecklist')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeChecklistOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{ json: mockResponse, pairedItem: { item: 0 } },
			]);
		});
	});

	describe('unpublishChecklist', () => {
		it('should unpublish a checklist successfully', async () => {
			const mockResponse = { success: true, message: 'Checklist unpublished' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('unpublishChecklist')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeChecklistOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{ json: mockResponse, pairedItem: { item: 0 } },
			]);
		});
	});
});

describe('Survey Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.appcues.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('getAllSurveys should fetch all surveys successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getAllSurveys';
      if (param === 'limit') return 50;
      if (param === 'offset') return 0;
      return undefined;
    });

    const mockResponse = { surveys: [{ id: '1', name: 'Test Survey' }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSurveyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.appcues.com/v1/surveys',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      qs: {
        limit: 50,
        offset: 0,
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('getSurvey should fetch specific survey successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSurvey';
      if (param === 'surveyId') return 'survey123';
      return undefined;
    });

    const mockResponse = { id: 'survey123', name: 'Test Survey' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSurveyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.appcues.com/v1/surveys/survey123',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('getSurveyResponses should fetch survey responses successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSurveyResponses';
      if (param === 'surveyId') return 'survey123';
      if (param === 'limit') return 50;
      if (param === 'offset') return 0;
      if (param === 'startDate') return '2023-01-01';
      if (param === 'endDate') return '2023-12-31';
      return undefined;
    });

    const mockResponse = { responses: [{ id: '1', rating: 9 }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSurveyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.appcues.com/v1/surveys/survey123/responses',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      qs: {
        limit: 50,
        offset: 0,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('publishSurvey should publish survey successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'publishSurvey';
      if (param === 'surveyId') return 'survey123';
      return undefined;
    });

    const mockResponse = { success: true, message: 'Survey published' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSurveyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.appcues.com/v1/surveys/survey123/publish',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: mockResponse,
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSurvey';
      if (param === 'surveyId') return 'invalid-id';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Survey not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeSurveyOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([
      {
        json: { error: 'Survey not found' },
        pairedItem: { item: 0 },
      },
    ]);
  });
});

describe('Analytics Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.appcues.com',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getEvents operation', () => {
		it('should retrieve events successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getEvents')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-01-31')
				.mockReturnValueOnce('flow_completed')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce(0);

			const mockResponse = { events: [{ id: '1', name: 'flow_completed' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/v1/analytics/events'),
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle errors when retrieving events', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getEvents');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
		});
	});

	describe('getFlowAnalytics operation', () => {
		it('should retrieve flow analytics successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getFlowAnalytics')
				.mockReturnValueOnce('flow123')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-01-31');

			const mockResponse = { analytics: { flow_id: 'flow123', views: 100 } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/v1/analytics/flows'),
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle errors when retrieving flow analytics', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getFlowAnalytics');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Flow not found'));

			await expect(executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Flow not found');
		});
	});

	describe('getUserAnalytics operation', () => {
		it('should retrieve user analytics successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getUserAnalytics')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-01-31')
				.mockReturnValueOnce('segment123');

			const mockResponse = { analytics: { active_users: 500, engagement_rate: 0.75 } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/v1/analytics/users'),
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('getFunnelAnalytics operation', () => {
		it('should retrieve funnel analytics successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getFunnelAnalytics')
				.mockReturnValueOnce('funnel123')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-01-31');

			const mockResponse = { funnel: { id: 'funnel123', conversion_rate: 0.15 } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/v1/analytics/funnel'),
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('getRetentionAnalytics operation', () => {
		it('should retrieve retention analytics successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getRetentionAnalytics')
				.mockReturnValueOnce('2023-01-01')
				.mockReturnValueOnce('2023-01-31')
				.mockReturnValueOnce('weekly');

			const mockResponse = { retention: { cohort_type: 'weekly', rates: [0.8, 0.6, 0.4] } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAnalyticsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/v1/analytics/retention'),
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});
});
});
