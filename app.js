/* Static application: no API keys, server, or build step. */
(() => {
  "use strict";

  document.getElementById("local-warning").hidden = location.protocol !== "file:";

  const status = document.getElementById("status");
  if (!window.L) {
    status.textContent = "Could not load the map. Check your internet connection and reload the page.";
    return;
  }

  const map = L.map("map", { worldCopyJump: true }).setView([25, 15], 3);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  map.zoomControl.setPosition("bottomright");

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

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng], { title: "Selected spot", alt: "Selected location for Froggy" }).addTo(map);
    if (zoomToPoint) map.setView([lat, lng], Math.max(map.getZoom(), 6));
    marker.bindPopup(content, { maxWidth: 260 }).openPopup();
    status.textContent = "Spot selected. Bookmark or share this page to return to it.";
    // Hash also works when the page is hosted in a GitHub Pages subdirectory.
    try { history.replaceState(null, "", `#${new URLSearchParams({ lat: String(lat), lng: String(lng) })}`); }
    catch { /* file:// and privacy settings may restrict history access. */ }
  }

  map.on("click", ({ latlng }) => selectPoint(Math.max(-90, Math.min(90, latlng.lat)), latlng.lng));

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
  if (window.ResizeObserver) new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById("map"));
})();
