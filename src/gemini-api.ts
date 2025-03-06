/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface GeminiResponse {
  candidates: string[];
}

export interface GeminiRequest {
  contents: string;
}

const baseParams: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
  method: 'post',
  muteHttpExceptions: true,
  contentType: 'application/json',
  headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
};

const createRequestOptions = (payload: GeminiRequest) =>
  Object.assign({ payload: JSON.stringify(payload),  }, baseParams);

const fetchJson = <T>(
  url: string,
  params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
) => JSON.parse(UrlFetchApp.fetch(url, params).getContentText()) as T;

export const getGeminiEndpoint = (
  projectId: string,
  region: string,
): string => {
  return `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/gemini-pro:generateContent`;
};

export const getGeminiBody = (
  concept: string,
): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions => {
      const payload: GeminiRequest = {
        contents: concept
      }
    return createRequestOptions({
      instances: [
        {
          prompt: `Generate a detailed prompt about ${concept}`,
        },
      ],
    });
};

export const generateGeminiPrompt = (
  concept: string,
  projectId: string,
  region: string,
): GeminiResponse => {
  const geminiEndpoint = getGeminiEndpoint(projectId, region);
  const res = fetchJson<GeminiResponse>(
    geminiEndpoint,
    getGeminiBody( {
      contents : concept
    })
  );
  return res;
};
