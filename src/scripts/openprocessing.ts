const OPENPROCESSING_BASE_URL = "https://openprocessing.org/api";

export interface OpenProcessingSketch {
  visualID: number;
  title?: string;
  [key: string]: unknown;
}

export interface OpenProcessingCuration {
  visualID?: number;
  id?: number;
  sketches?: OpenProcessingSketch[];
  [key: string]: unknown;
}

interface OpenProcessingConfig {
  token: string;
  curationId: string;
}

function getConfig(): OpenProcessingConfig {
  const token = process.env.OPENPROCESSING_TOKEN;
  const curationId = process.env.OPENPROCESSING_CURATION_ID;

  if (!token) {
    throw new Error(
      "Missing OPENPROCESSING_TOKEN environment variable."
    );
  }

  if (!curationId) {
    throw new Error(
      "Missing OPENPROCESSING_CURATION_ID environment variable."
    );
  }

  return {
    token,
    curationId,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { token } = getConfig();

  const response = await fetch(`${OPENPROCESSING_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `OpenProcessing request failed: ${response.status} ${response.statusText}\n${body}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function getCuration(): Promise<OpenProcessingCuration> {
  const { curationId } = getConfig();

  return request<OpenProcessingCuration>(
    `/curation/${curationId}`
  );
}

export async function getCurationSketches(): Promise<
  OpenProcessingSketch[]
> {
  const { curationId } = getConfig();

  return request<OpenProcessingSketch[]>(
    `/curation/${curationId}/sketches`
  );
}

export async function addSketchToCuration(
  visualID: number
): Promise<void> {
  const { curationId } = getConfig();

  await request<void>(
    `/curation/${curationId}/sketches/${visualID}`,
    {
      method: "POST",
    }
  );
}

export async function removeSketchFromCuration(
  visualID: number
): Promise<void> {
  const { curationId } = getConfig();

  await request<void>(
    `/curation/${curationId}/sketches/${visualID}`,
    {
      method: "DELETE",
    }
  );
}