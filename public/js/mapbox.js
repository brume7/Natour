const mapDiv = document.getElementById('map');
const locations = JSON.parse(mapDiv.dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiYnJ1bWUiLCJhIjoiY2xwcmQxZHBpMDN1MzJscXB1eWtlNGs2biJ9.DPd3IPU1C0IeYmaJUck14w';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/brume/clprdrk4z013m01qt8ht58fyk',
  scrollZoom: false
  //   center: locations[0].coordinates,
  //   zoom: 9
});

map.addControl(new mapboxgl.NavigationControl());

const bounds = new mapboxgl.LngLatBounds();

for (const location of locations) {
  const el = document.createElement('div');
  el.className = 'marker';
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
    closeOnClick: false
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</P>`)
    .addTo(map);

  bounds.extend(location.coordinates);
}

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
