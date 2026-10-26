# Froggy — Pick a place

A static app that displays an OpenStreetMap map and launches Froggy's World in a new tab with the coordinates of a spot you select. Click with a mouse or tap on a phone. Drag to move the map and pinch to zoom on touchscreens. You can also enter exact coordinates and bookmark or share the selected spot using the page URL.

## Local use

On Windows, double-click `start-local.cmd`. Python 3 must be installed and available as `python`. The script starts an HTTP server accessible only from your computer and opens the app in your default browser. Keep the server window open while using the app. Press Ctrl+C or close the window to stop it.

Do not open `index.html` directly using `file://`: OSM requires an HTTP Referer header, which local files do not provide. Map tiles may show Access blocked / 403 instead. The helper scripts are only for local use; GitHub Pages serves the static app without them.

An internet connection is required: Leaflet 1.9.4 loads from unpkg and map tiles load from OSM. Alternatively, run this command from the app folder:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Then open http://127.0.0.1:8080. No Node.js, npm, build step, application backend, or API keys are required.

## GitHub Pages

1. Copy the contents of this folder to the root of a dedicated GitHub repository, or to `docs/` in an existing repository.
2. Under **Settings → Pages → Build and deployment**, select **Deploy from a branch**.
3. Select the `main` branch and `/ (root)` (or `/docs`), then click **Save**.
4. Open the URL provided by GitHub Pages.

All local asset paths are relative, so the app also works at `https://USER.github.io/REPOSITORY/`. You do not need to publish any other research files from the parent project. `serve.py` and `start-local.cmd` are not needed for hosting.

## Game launch URL

```text
https://dailygames.discover.google.com/games/froggy?immersive=1&lat=59.9386&lng=30.3141&unit=m
```

`lat` is latitude, `lng` is longitude, and `unit=m` selects metric units. Support for `lat`/`lng` was verified in the saved game module dated October 19, 2026 (`yCa`). This is an internal game URL format and Google may change it. The game may remove coordinates from its visible URL after initialization. Opening a tab does not guarantee that the game or weather data will be available for every location.

The map uses Web Mercator and displays latitudes up to approximately ±85°. You can enter coordinates for the poles manually: the launch link uses the entered coordinates, although the marker appears at the edge of the projection. Selected coordinates are rounded to six decimal places.

## Dependencies and data

- [Leaflet 1.9.4](https://leafletjs.com/examples/quick-start/) provides the map, markers, and popups. The version is pinned and its CSS/JS files use SRI integrity hashes.
- [OpenStreetMap](https://www.openstreetmap.org/copyright) provides map data. Attribution remains visible on the map.
- [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/) applies. The app uses standard browser caching, without bulk prefetching or offline downloads. For heavy traffic, choose an appropriate tile provider; the tile URL is configured in `app.js`.

The app does not request device geolocation or store data on an application server. The selected coordinates are included in the page URL. The browser requests visible map tiles from OSM and the map library from unpkg. Launching the game sends the selected coordinates to Google. Map labels are supplied by OSM tiles and may use local languages. This is an independent tool, not an official Google or OSM product.
