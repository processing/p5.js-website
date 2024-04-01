// HELPER FUNCTIONS TO USE THE OPENPROCESSING API
// SEE https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#intro

const openProcessingEndpoint = "https://openprocessing.org/api/";
const curationId = "78544";

// see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
export type OpenProcessingCurationResponse = ReadonlyArray<
  // for some reason these aren't present in the curation response
  Omit<OpenProcessingSketchResponse, "instructions" | "license" | "createdOn">
>;

export const getCurationSketches =
  async (): Promise<OpenProcessingCurationResponse> => {
    const response = await fetch(
      `${openProcessingEndpoint}curation/${curationId}/sketches`,
    );
    const payload = await response.json();
    return payload as OpenProcessingCurationResponse;
  };

// see https://documenter.getpostman.com/view/16936458/2s9YC1Xa6X#7cd344f6-6e87-426a-969b-2b4a79701dd1
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
  /** Sketch Creator's full name */
  fullname: string;
  submittedOn: string;
  createdOn: string;
};

/**
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
