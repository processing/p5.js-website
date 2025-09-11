// src/api/OpenProcessing.test.ts

import { getCurationSketches, getSketch, getSketchSize, priorityIds, type OpenProcessingCurationResponse } from '@/src/api/OpenProcessing';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

// Test data: first item is mock data, second uses actual priority ID from current curation
const getCurationSketchesData : OpenProcessingCurationResponse = [{
    visualID: 101,
    title: 'Sketch One',
    description: 'Description One',
    instructions: 'Instructions One',
    mode: 'p5js',
    createdOn: '2025-01-01',
    userID: 'User One',
    submittedOn: '2025-01-01',
    fullname: 'Fullname One'
}, 
{
    visualID: Number(priorityIds[0]), // Real ID from current curation priority list
    title: 'Sketch Two',
    description: 'Description Two',
    instructions: 'Instructions Two',
    mode: 'p5js',
    createdOn: '2025-01-01',
    userID: 'User Two',
    submittedOn: '2025-01-01',
    fullname: 'Fullname Two'
}]

describe('OpenProcessing API Caching', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    getCurationSketches.cache.clear?.();
    getSketch.cache.clear?.();
    getSketchSize.cache.clear?.();
  });

  // Case 1: Verify caching for getCurationSketches
  it('should only call the API once even if getCurationSketches is called multiple times', async () => {

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(getCurationSketchesData),
    });

    await getCurationSketches();
    await getCurationSketches();

    // Check if fetch was called exactly 2 times (for the two curation IDs).
    // If this number becomes 4, it means the caching is broken.
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // Case 2: Verify getSketch uses cached data from getCurationSketches
  it('should use cached data from getCurationSketches for getSketch calls', async () => {

    mockFetch.mockResolvedValueOnce({ // for curationId
      ok: true,
      json: () => Promise.resolve([getCurationSketchesData[0]]),
    }).mockResolvedValueOnce({ // for newCurationId
      ok: true,
      json: () => Promise.resolve([getCurationSketchesData[1]]),
    });

    // Call the main function to populate the cache.
    await getCurationSketches();
    // At this point, fetch has been called twice.
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Now, call getSketch with an ID that should be in the cache.
    const sketch = await getSketch(getCurationSketchesData[0].visualID);
    expect(sketch.title).toBe('Sketch One');
    const sketch2 = await getSketch(getCurationSketchesData[1].visualID);
    expect(sketch2.title).toBe('Sketch Two');

    // Verify that no additional fetch calls were made.
    // The call count should still be 2 because the data came from the cache.
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // Case 3: Verify getSketch fetches individual sketch when not in cache
  it('should fetch individual sketch when not in cache', async () => {

    // for curationId
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    }).mockResolvedValueOnce({ // for newCurationId
      ok: true, 
      json: () => Promise.resolve([])
    });

    await getCurationSketches(); // Create empty cache
    
    // Individual sketch API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ visualID: 999, title: 'Individual Sketch' })
    });
    
    const sketch = await getSketch(999);
    expect(sketch.title).toBe('Individual Sketch');
    expect(mockFetch).toHaveBeenCalledTimes(3); // 2 for empty curations in getCurationSketches + 1 for individual call in getSketch
  });

  // Case 4: Overall regression test for total sketch page generation
  it('should not exceed the expected number of API calls during a build simulation', async () => {

    // Mock the responses for getCurationSketches.
    mockFetch.mockResolvedValueOnce({ // for curationId
      ok: true,
      json: () => Promise.resolve([getCurationSketchesData[0]]),
    }).mockResolvedValueOnce({ // for newCurationId
      ok: true,
      json: () => Promise.resolve([getCurationSketchesData[1]]),
    });

    // 2. Mock the response for getSketchSize calls.
    mockFetch.mockResolvedValue({ // for all subsequent calls
      ok: true,
      json: () => Promise.resolve([{ code: 'createCanvas(400, 400);' }]),
    });

    // --- sketch page build simulation ---
    // This simulates what happens during `getStaticPaths`.
    const sketches = await getCurationSketches(); // Makes 2 API calls.
    
    // This simulates what happens as each page is generated.
    for (const sketch of sketches) {
      // Inside the page component, getSketch and getSketchSize would be called.
      await getSketch(sketch.visualID); // Uses cache (0 new calls).
      await getSketchSize(sketch.visualID); // Makes 1 new API call.
    }
    // --- simulation end ---

    // Calculate the total expected calls.
    // 2 for getCurationSketches + 1 for each sketch's getSketchSize call.
    const expectedCalls = 2 + sketches.length;
    expect(mockFetch).toHaveBeenCalledTimes(expectedCalls);

  });
});