import { tutorialsCollection } from "./tutorials/config";
import { eventsCollection } from "./events/config";
import { librariesCollection } from "./libraries/config";
import { peopleCollection } from "./people/config";
import { referenceCollection } from "./reference/config";
import { textDetailCollection } from "./text-detail/config";
import { examplesCollection } from "./examples/config";
import { contributorDocsCollection } from "./contributor-docs/config";
import { homepageCollection } from "./homepage/config";
import { pagesCollection } from "./pages/config";

/**
 * All content collections defined in subfolders of /src/content/
 * must be imported into this file and exported in the object below.
 * Astro uses this object to know which content collections exist to
 * build into the site.
 */
export const collections = {
  tutorials: tutorialsCollection,
  events: eventsCollection,
  libraries: librariesCollection,
  people: peopleCollection,
  reference: referenceCollection,
  "text-detail": textDetailCollection,
  examples: examplesCollection,
  "contributor-docs": contributorDocsCollection,
  homepage: homepageCollection,
  pages: pagesCollection,
};
