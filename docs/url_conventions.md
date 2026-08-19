# URL conventions

## Trailing slash in URLs

All URLs for resources on the website should end with a slash character (`/`).  

For example, the correct URL for the reference page about the `circle` function is
* good: https://beta.p5js.org/reference/p5/circle/
* bad: https://beta.p5js.org/reference/p5/circle

More correctly, it should come at the end of the _path_ part of the URL.  

If a query string or hash/fragment is present in the URL, the trailing slash should come before those, as shown in these examples:

Example with a query string
* good: https://beta.p5js.org/search/?term=colorMode
* bad: https://beta.p5js.org/search?term=colorMode/
* bad: https://beta.p5js.org/search?term=colorMode

Example with a hash / fragment part
* good: https://beta.p5js.org/contribute/documentation_style_guide/#comments
* bad: https://beta.p5js.org/contribute/documentation_style_guide#comments/

#### Other correct examples
* https://beta.p5js.org/download/
* https://beta.p5js.org/reference/
* https://beta.p5js.org/tutorials/
* https://beta.p5js.org/examples/
* https://beta.p5js.org/tutorials/get-started/
* https://beta.p5js.org/examples/shapes-and-color-shape-primitives/
* https://beta.p5js.org/

### Automatic trailing slash addition
While the production webserver _may_ add a trailing slash to a requested URL when it is missing, but this should not be relied upon.  
Instead write (or generate) links that follow the rules above.

## Case in URLs

URL casing is somewhat inconsistent across the website. Guidelines for new resources:

* Prefer lower-case
* Spaces should not be used in URLs.
* In place of spaces, dashes (`-`) should ideally be used in preference to underscores (`_`).
* First, however, follow established local conventions used by other resources of the same type
  * e.g. all contributor docs use underscores "like_this"

#### Examples of kebab-case URL:
* https://beta.p5js.org/tutorials/variables-and-change/
* https://beta.p5js.org/examples/3d-orbit-control/
* https://beta.p5js.org/code-of-conduct/

### A case exception: reference pages

In reference pages, the URLs follow the names of the functions, classes, and variables. So, they include some capitals and use "camel-case" e.g. `createCanvas`.

#### Examples of reference page URLs
* https://p5js.org/reference/p5.Vector/fromAngle/
* https://beta.p5js.org/reference/p5/p5.Image/

More on reference page URLs can be found in https://beta.p5js.org/contribute/contributing_to_the_p5js_reference/#linking