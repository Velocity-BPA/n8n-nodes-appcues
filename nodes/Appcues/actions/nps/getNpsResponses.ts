/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest, buildQueryParams } from '../../transport/GenericFunctions';
import { prepareExecutionData, formatNpsCategory, calculateNps } from '../../utils/helpers';

export async function getNpsResponses(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const surveyId = this.getNodeParameter('surveyId', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query = buildQueryParams({
    from: additionalFields.dateFrom,
    to: additionalFields.dateTo,
    limit: additionalFields.limit,
    offset: additionalFields.offset,
  });

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/nps/surveys/${encodeURIComponent(surveyId)}/responses`,
    undefined,
    query,
  );

  // Enhance responses with NPS category
  if (Array.isArray(response)) {
    const enhancedResponses = response.map((r: any) => ({
      ...r,
      nps_category: formatNpsCategory(r.score),
    }));

    // Calculate overall NPS if requested
    if (additionalFields.includeNpsScore) {
      const npsScore = calculateNps(response);
      return [
        {
          json: {
            survey_id: surveyId,
            nps_score: npsScore,
            total_responses: response.length,
            responses: enhancedResponses,
          },
          pairedItem: { item: index },
        },
      ];
    }

    return prepareExecutionData(enhancedResponses, { item: index });
  }

  return prepareExecutionData(response as IDataObject, { item: index });
}
