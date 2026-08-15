import { tutorialsCollection } from "./content/tutorials/config";
import { eventsCollection } from "./content/events/config";
import { librariesCollection } from "./content/libraries/config";
import { peopleCollection } from "./content/people/config";
import { referenceCollection } from "./content/reference/config";
import { textDetailCollection } from "./content/text-detail/config";
import { examplesCollection } from "./content/examples/config";
import { contributorDocsCollection } from "./content/contributor-docs/config";
import { homepageCollection } from "./content/homepage/config";
import { pagesCollection } from "./content/pages/config";
import { bannerCollection } from "./content/banner/config";

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
  banner: bannerCollection,
};
