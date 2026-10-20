const coordinate = [1.3521, 103.8198];

// the parameter is the id that will contain the map
const map = L.map("map");
// the first parameter is center point of map
// the second parameter is the zoom level (larger more zoomed in)
map.setView(coordinate,13);

const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    referrerPolicy: 'strict-origin-when-cross-origin'
}).addTo(map);
// a layer is one "thing" being drawn

const marker = L.marker([1.35019,103.99400]);
marker.bindPopup(`<h1>Welcome to Singapore</h1>`);
marker.addTo(map);