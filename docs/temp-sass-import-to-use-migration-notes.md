## TODO:
Use `--fatal-deprecation=import` to prevent any regressive use of @import - this will treat any sass @import rules as errors.

Whilst the changed sass seems to be working fine, it's _possible_ that in our astro config, within `vite: {}`, we will want to tell sass to look in the project root when we use @use without an absolute path.  e.g. `@use "styles/variables.scss"`
```json
    css: {
      preprocessorOptions: {
        scss: {
          // This tells Sass to look in the project root for any @use paths
          loadPaths: [path.resolve('./')],
        },
      },
    },
```
This will also need `import path from 'path';`


## notes
change: moved from use of @import to @use
reason: lots of noisy deprecation warnings about our use of @import, when running the astro site.
change 2: changed paths from `/styles/variables.scss` to `styles/variables.scss`


process:

read: https://sass-lang.com/blog/import-is-deprecated/
read: https://sass-lang.com/documentation/at-rules/use/#differences-from-import

used
```
npx sass-migrator module --migrate-deps --load-path=. "styles/*.scss"
```
* The migrator failed because it couldn't parse .astro files
* Manually updated the @import to @use in Astro components (only one, at the time, HomepageLayout)
* ran the migrator
* checked that multiple uses of @use aren't causing the same large chunk of html to be copied to output css files.
* it may still be worth a split of variables.scss to separate the sass variables - which may be imported with @use in many places,from the rest of the css variables defined in there, which can be loaded in just once to some sort of base css file.

