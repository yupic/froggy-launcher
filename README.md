# Froggy — Pick a place

A static app that displays an OpenStreetMap map and launches Froggy's World in a new tab with the coordinates of a spot you select. Click with a mouse or tap on a phone. Drag to move the map and pinch to zoom on touchscreens. You can also enter exact coordinates and bookmark or share the selected spot using the page URL.

## Local use

On Windows, double-click `start-local.cmd`. Python 3 must be installed and available as `python`. The script starts an HTTP server accessible only from your computer and opens the app in your default browser. Keep the server window open while using the app. Press Ctrl+C or close the window to stop it.

Use the local HTTP server instead of opening `index.html` directly using `file://`, so map resources load reliably. The helper scripts are only for local use; GitHub Pages serves the static app without them.

An internet connection is required: MapLibre GL JS 5.24.0 loads from unpkg and map resources load from OpenFreeMap. Alternatively, run this command from the app folder:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Then open http://127.0.0.1:8080. No Node.js, npm, build step, application backend, or API keys are required.

## GitHub Pages

Live site: https://yupic.github.io/froggy-launcher/

The `.github/workflows/pages.yml` workflow deploys the site using GitHub Actions. Changes to `index.html`, `app.js`, `styles.css`, or the workflow on `main` trigger deployment. You can also run it manually from the Actions tab.

Only `index.html`, `app.js`, and `styles.css` are copied into the deployment artifact. Local helpers (`serve.py`, `start-local.cmd`), this README, and repository metadata are excluded from the published website. Files committed to this public repository remain publicly accessible on GitHub.

For a fork, enable Pages under **Settings → Pages → Build and deployment → Source → GitHub Actions**, then run the workflow. All local asset paths are relative, so the app works in a repository subdirectory.

## Map label language

Map labels always show English and the local name. The local name appears on a second line only when it differs from the English name. There is no language selector or saved language preference.

Labels prefer the English translation in OSM, then a Latin-script name or transliteration, then the local name. Not every feature has an English translation. Bilingual labels apply to names of places, roads, water features, and points of interest; route numbers are preserved. The map uses OpenFreeMap's Liberty vector style and requires browser WebGL support.

## Game launch URL

```text
https://dailygames.discover.google.com/games/froggy?immersive=1&lat=59.9386&lng=30.3141&unit=m
```

`lat` is latitude, `lng` is longitude, and `unit=m` selects metric units. Support for `lat`/`lng` was verified in the saved game module dated October 19, 2026 (`yCa`). This is an internal game URL format and Google may change it. The game may remove coordinates from its visible URL after initialization. Opening a tab does not guarantee that the game or weather data will be available for every location.

The map uses Web Mercator and displays latitudes up to approximately ±85°. You can enter coordinates for the poles manually: the launch link uses the entered coordinates, although the marker appears at the edge of the projection. Selected coordinates are rounded to six decimal places.

## Dependencies and data

- [MapLibre GL JS 5.24.0](https://maplibre.org/maplibre-gl-js/docs/) provides the map, markers, and popups. The version is pinned and its CSS/JS files use SRI integrity hashes.
- [OpenStreetMap](https://www.openstreetmap.org/copyright) provides map data. Attribution remains visible on the map.
- [OpenFreeMap](https://openfreemap.org/) provides vector tiles, fonts, sprites, and the Liberty style, using the OpenMapTiles schema. Attribution is displayed on the map. The style URL is configured in `app.js`.

The app does not request device geolocation or store data on an application server. The selected coordinates are included in the page URL. The browser requests map resources from OpenFreeMap and the map library from unpkg. Launching the game sends the selected coordinates to Google. This is an independent tool, not an official Google, OpenFreeMap, or OSM product.
