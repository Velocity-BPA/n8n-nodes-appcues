/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { appcuesApiRequest } from '../../transport/GenericFunctions';
import { prepareExecutionData } from '../../utils/helpers';

export async function getNpsSurvey(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const surveyId = this.getNodeParameter('surveyId', index) as string;

  const response = await appcuesApiRequest.call(
    this,
    'GET',
    `/nps/surveys/${encodeURIComponent(surveyId)}`,
  );

  return prepareExecutionData(response as IDataObject, { item: index });
}
