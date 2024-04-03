// HELPER FUNCTIONS TO USE THE OPENPROCESSING API
// SEE https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#intro

const openProcessingEndpoint = "https://openprocessing.org/api/";
/**
 * ID of the OpenProcessing Curation we pull sketches from.
 * Currently a placeholder (https://openprocessing.org/curation/78544/)
 */
const curationId = "78544";

/**
 * API Response from a call to the Curation Sketches endpoint
 *
 * see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 */
export type OpenProcessingCurationResponse = ReadonlyArray<{
  /** Sketch ID used for constructing URLs */
  visualID: string;
  /** Title of sketch */
  title: string;
  /** Description of sketch */
  description: string;
  userID: string;
  submittedOn: string;
  /** Author's name */
  fullname: string;
}>;

/**
 * Get basic info for the sketches contained in a Curation
 * from the OpenProcessing API
 *
 * @param limit max number of sketches to return
 * @returns sketches
 */
export const getCurationSketches = async (
  // TODO: Remove when we have real data
  limit: number = 25,
): Promise<OpenProcessingCurationResponse> => {
  const limitParam = limit ? `limit=${limit}` : "";
  const response = await fetch(
    `${openProcessingEndpoint}curation/${curationId}/sketches?${limitParam}`,
  );
  const payload = await response.json();
  return payload as OpenProcessingCurationResponse;
};

/**
 * API Response from a call to the Sketch endpoint
 *
 * see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 */
export type OpenProcessingSketchResponse = {
  /** Sketch ID used for constructing URLs */
  visualID: string;
  /** Title of sketch */
  title: string;
  /** Description of sketch */
  description: string;
  instructions: string;
  license: string;
  userID: string;
  submittedOn: string;
  createdOn: string;
};

/**
 * Get info about a specific sketch from the OpenProcessing API
 *
 * https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
 * @param id
 * @returns
 */
export const getSketch = async (
  id: string,
): Promise<OpenProcessingSketchResponse> => {
  const response = await fetch(`${openProcessingEndpoint}sketch/${id}`);
  const payload = await response.json();
  return payload as OpenProcessingSketchResponse;
};

export const makeSketchLinkUrl = (id: string) =>
  `https://openprocessing.org/sketch/${id}`;

export const makeThumbnailUrl = (id: string) =>
  `https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail${id}.jpg`;
