# Banner

A banner can optionally be added at the bottom of the page with a custom message and link.

## Adding a new banner

Edit the banner text in the body of `src/content/banner/en.mdx`.

Within the file's metadata:
- Change the `title` metadata to a new slug for each message. This does not get displayed anywhere, but it gets recorded when a user dismisses the banner. This way, we can hide that banner for the user the next time they return, but still show them a new banner when we create a new message.
- Make sure `hidden` is `true` for the banner to be visible

## Translating banners

Copy the `en.mdx` file to `${locale}.mdx` (e.g. `es.mdx`) and translate just the body text, leaving the metadata the same.

## Removing a banner

- Set `hidden` to `true` in `src/content/banner/en.mdx`
- Delete any translations of the banner that have been made in non-`en` locales.

  This is to make sure that the next time a new banner is made, there is a clean slate to start from for translations.
