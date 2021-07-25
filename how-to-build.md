# How to build

## Prepare data

The following process fetches country data and the flag images from Wikipedia, calculate the feature data for image retrieval, and convert the data to json.

Note: Use ImageMagick 7 or later. Older ImageMagick seems to break some image files.

```
$ cd scripts
$ ruby fetch-all.rb
$ ruby gen-flags.rb
$ ruby gen-names.rb
$ ruby gen-clut.rb # optional
$ ruby gen-features.rb
$ ruby gen-db.rb
```

This process generates `/flags.json` and `public/images/flags/??.png`.

## Build Next.js app

```
$ npm install
```

Hack: [Edit `node_modules/next/dist/export/index.js` to enable i18n with next export](https://github.com/vercel/next.js/issues/18318#issuecomment-724071925).

```
$ npx next build
$ npx next export -o docs
$ touch docs/.nojekyll
$ cp redirect-to-en.html docs/index.html
```
