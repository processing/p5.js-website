# Community Sketches

Community sketches [from our curation](https://openprocessing.org/curation/87649) are fetched dynamically from OpenProcessing's API. The thumbnails generated from OpenProcessing are 400x400, but we display a few featured sketches at a larger size on the homepage and community page, so we also manually provide thumbnails at a larger resolution.

## Adding a new sketch

1. Add it to the curation on OpenProcessing
2. Take a screenshot of the sketch at a resolution of 1500x1000 as a `.png`
3. Add it to `src/api/images`, naming it after the ID of the sketch (the numeric part of the OpenProcessing URL.)

   For example, the sketch https://openprocessing.org/sketch/2211029 would be saved as `2211029.png` in the folder.
