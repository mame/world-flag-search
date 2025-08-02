# How to build

## Prepare data

The following process fetches country data and the flag images from Wikipedia, calculate the feature data for image retrieval, and convert the data to json.

Note: Use ImageMagick 7 or later. Older ImageMagick seems to break some image files.

```
$ cd scripts
$ ruby fetch-all.rb # very slow
$ ruby gen-flags.rb
$ ruby gen-names.rb
$ ruby gen-norm-pngs.rb
$ ruby gen-palette.rb # very slow
$ ruby gen-features.rb
$ ruby gen-db.rb
```

This process generates `/flags.json`, `/palette.json`, and `public/images/flags/??.png`.

## Debug the app

```
$ npm install
$ npx next dev
```

and open http://localhost:3000/.

## Build the app

```
$ npm install
```

Hack: [Edit `node_modules/next/dist/export/index.js` to enable i18n with next export](https://github.com/vercel/next.js/issues/18318#issuecomment-724071925).

```
$ npx next build
$ touch docs/.nojekyll
$ cp redirect-to-en.html docs/index.html
```
