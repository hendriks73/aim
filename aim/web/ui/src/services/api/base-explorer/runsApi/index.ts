import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { SequenceTypesEnum } from 'types/core/enums';

import { RequestInstance } from '../../../NetworkService/types';

import { RunsSearchQueryParams, RunsSearchResult } from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.RUNS.BASE}`);

/**
 * function searchRuns
 * this call is used for getting explorer' data
 * @param sequence - sequence name
 * @param queryParams
 */
async function searchRuns(
  sequence: SequenceTypesEnum,
  queryParams: RunsSearchQueryParams,
): Promise<RunsSearchResult> {
  return (
    await api.makeAPIGetRequest(`${ENDPOINTS.RUNS.SEARCH}/${sequence}`, {
      query_params: queryParams,
    })
  ).body;
}

function createSearchRunsRequest(sequence: SequenceTypesEnum): RequestInstance {
  const controller = new AbortController();
  const signal = controller.signal;

  async function call(
    queryParams: RunsSearchQueryParams,
  ): Promise<RunsSearchResult> {
    return (
      await api.makeAPIGetRequest(`${ENDPOINTS.RUNS.SEARCH}/${sequence}`, {
        query_params: queryParams,
        signal,
      })
    ).body;
  }

  function cancel(): void {
    controller.abort();
  }

  return {
    call,
    cancel,
  };
}

export { searchRuns, createSearchRunsRequest };
export * from './types';