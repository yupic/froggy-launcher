/* Static application: no API keys, server, or build step. */
(() => {
  "use strict";

  document.getElementById("local-warning").hidden = location.protocol !== "file:";

  const status = document.getElementById("status");
  if (!window.maplibregl) {
    status.textContent = "Could not load the map. Check your internet connection and reload the page.";
    return;
  }

  let map;
  try {
    map = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [15, 25],
      zoom: 2,
      maxZoom: 19,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
    });
  } catch {
    status.textContent = "Could not start the map. Enable WebGL in your browser and reload the page.";
    return;
  }
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
  map.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-left");

  // Ignore empty translations and fall back to a Latin name, then the local name.
  function nonEmptyName(field) {
    return ["case", ["all", ["has", field], ["!=", ["get", field], ""]], ["get", field], null];
  }

  function labelExpression() {
    const english = ["to-string", ["coalesce", nonEmptyName("name:en"), nonEmptyName("name_en"),
      nonEmptyName("name:latin"), nonEmptyName("name"), ""]];
    return ["let", "english", english, "local", ["to-string", ["coalesce", nonEmptyName("name"), english]],
      ["case", ["!=", ["var", "english"], ["var", "local"]],
        ["concat", ["var", "english"], "\n", ["var", "local"]], ["var", "english"]]];
  }

  // Keep route numbers and other non-name labels unchanged.
  function usesName(expression) {
    return Array.isArray(expression) && (
      (expression[0] === "get" && /^name(?::|_|$)/.test(expression[1])) || expression.some(usesName)
    );
  }

  function applyLanguage() {
    for (const layer of map.getStyle().layers) {
      if (layer.type === "symbol" && usesName(layer.layout?.["text-field"])) {
        map.setLayoutProperty(layer.id, "text-field", labelExpression());
      }
    }
  }

  map.on("style.load", applyLanguage);
  map.on("error", (event) => {
    console.warn("Map error:", event.error);
    status.textContent = "Some map data could not be loaded. Check your connection or reload the page.";
  });

  const latitude = document.getElementById("latitude");
  const longitude = document.getElementById("longitude");
  let marker;

  function selectPoint(lat, lng, zoomToPoint = false) {
    // A wrapped map may return longitudes outside [-180, 180].
    lng = ((lng + 180) % 360 + 360) % 360 - 180;
    lat = Number(lat.toFixed(6));
    lng = Number(lng.toFixed(6));
    latitude.value = String(lat);
    longitude.value = String(lng);

    const url = new URL("https://dailygames.discover.google.com/games/froggy");
    url.search = new URLSearchParams({ immersive: "1", lat: String(lat), lng: String(lng), unit: "m" });

    const content = document.createElement("div");
    const title = document.createElement("h2");
    title.className = "point-title";
    title.textContent = "Take Froggy here";
    const coordinates = document.createElement("p");
    coordinates.className = "point-coordinates";
    coordinates.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const link = document.createElement("a");
    link.className = "launch";
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Launch Froggy ↗";
    const note = document.createElement("small");
    note.className = "new-tab";
    note.textContent = "Opens in a new tab";
    content.append(title, coordinates, link, note);

    if (marker) marker.remove();
    marker = new maplibregl.Marker({ color: "#245c44" }).setLngLat([lng, lat]).addTo(map);
    marker.getElement().setAttribute("aria-label", "Selected location for Froggy");
    marker.getElement().title = "Selected spot";
    if (zoomToPoint) map.jumpTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 5) });
    marker.setPopup(new maplibregl.Popup({ offset: 30, maxWidth: "260px" }).setDOMContent(content)).togglePopup();
    status.textContent = "Spot selected. Bookmark or share this page to return to it.";
    // Hash also works when the page is hosted in a GitHub Pages subdirectory.
    try { history.replaceState(null, "", `#${new URLSearchParams({ lat: String(lat), lng: String(lng) })}`); }
    catch { /* file:// and privacy settings may restrict history access. */ }
  }

  map.on("click", ({ lngLat }) => selectPoint(Math.max(-90, Math.min(90, lngLat.lat)), lngLat.lng));

  function parseCoordinate(value) {
    return value.trim() === "" ? NaN : Number(value.trim().replace(",", "."));
  }

  document.getElementById("coordinates").addEventListener("submit", (event) => {
    event.preventDefault();
    const lat = parseCoordinate(latitude.value);
    const lng = parseCoordinate(longitude.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      status.textContent = "Enter a latitude from −90 to 90 and a longitude from −180 to 180. Decimal points and commas are accepted.";
      return;
    }
    selectPoint(lat, lng, true);
  });

  function restorePoint() {
    const params = new URLSearchParams(location.hash.slice(1));
    const lat = parseCoordinate(params.get("lat") ?? "");
    const lng = parseCoordinate(params.get("lng") ?? "");
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      selectPoint(lat, lng, true);
    }
  }
  restorePoint();
  window.addEventListener("hashchange", restorePoint);
  // Header changes height when the coordinate form opens or the phone rotates.
  if (window.ResizeObserver) new ResizeObserver(() => map.resize()).observe(document.getElementById("map"));
})();
