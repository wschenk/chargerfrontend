import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { googleLookup } from "./googleMaps.js";

const CHARGEMAP_URL = import.meta.env.VITE_CHARGEMAP_URL;

L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
L.Icon.Default.imagePath = "";

class ClusterMap extends HTMLElement {
  static get observedAttributes() {
    return ["latlon", "connectors", "filter"];
  }

  connectedCallback() {
    this.insertAdjacentHTML(
      "beforeend",
      '<div id="map" style="height:100%"></div>'
    );

    this.setLatLon();

    this.map = L.map("map", {
      center: [this.lat, this.lon],
      zoom: 11,
      zoomControl: true,
    });

    /*        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
*/
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}",
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
      }
    ).addTo(this.map);
    L.control
      .scale({
        imperial: true,
        maxWidth: 300,
      })
      .addTo(this.map);

    this.map.on("moveend", () => this.mapMove());
    this.mapMove();
  }

  setLatLon() {
    let latlon = this.getAttribute("latlon") || "41.84371,-73.32928";

    let s = latlon.split(",");
    this.lat = s[0];
    this.lon = s[1];

    if (this.map) {
      this.map.setView([this.lat, this.lon]);
    }
  }

  setFilter() {
    let filter = this.getAttribute("filter");
    console.log("filter", filter);

    let s = filter.split(",");
    this.dc = s[0];
    this.l1 = s[1];
    this.l2 = s[2];
  }

  attributeChangedCallback(name) {
    if (name == "latlon") {
      this.setLatLon();
    } else {
      this.setFilter();
      this.mapMove();
    }
  }

  mapMove() {
    this.networkEvent("markers:start");

    let b = this.map.getBounds();

    googleLookup(this.map.getCenter());

    let bounds = `n=${b.getNorth()}&e=${b.getEast()}&s=${b.getSouth()}&w=${b.getWest()}`;
    let connectors = `&connectors=${this.getAttribute("connectors")}`;
    let filters = `&dc=${this.dc}&level1=${this.l1}&level2=${this.l2}`;

    fetch(`${CHARGEMAP_URL}/in_map?${bounds}${connectors}${filters}`)
      .then((response) => response.json())
      .then((json) => {
        this.response = json;
        if (this.markers) {
          this.markers.remove();
        }

        let payload = {
          total: json.length,
          tesla: 0,
          j1772: 0,
          j1772combo: 0,
        };
        this.markers = L.markerClusterGroup();
        for (let i = 0; i < json.length; i++) {
          let m = L.marker([json[i].latitude, json[i].longitude]);
          m.bindPopup(this.renderPopup(json[i])).openPopup();
          this.markers.addLayer(m);

          if (json[i].tesla) {
            payload.tesla = payload.tesla + 1;
          }
          if (json[i].j1772) {
            payload.j1772 = payload.j1772 + 1;
          }
          if (json[i].j1772combo) {
            payload.j1772combo = payload.j1772combo + 1;
          }
        }

        this.map.addLayer(this.markers);
        this.networkEvent("markers:end", payload);
      });
  }

  renderPopup(s) {
    let h = `<h1>${s.name} ${s.id}</h1>
<p>${s.address}<br>${s.city}, ${s.state}, ${s.zip}</p>`;

    if (s.dcfast) {
      h += `<p>${s.dcfast} fast chargers</p>`;
    }

    if (s.level1) {
      h += `<p>${s.level1} level 1</p>`;
    }

    if (s.level2) {
      h += `<p>${s.level2} level 2</p>`;
    }

    h += `<p>${s.network} ${s.facility}</p>`;

    h += "<ul>";
    if (s.tesla) {
      h += `<li>NACS</li>`;
    }
    if (s.j1772) {
      h += `<li>J1772</li>`;
    }
    if (s.j1772combo) {
      h += `<li>CCS</li>`;
    }
    h += `</ul>`;

    return h;
  }

  networkEvent(type, payload) {
    let event = new CustomEvent("network", {
      bubbles: true,
      detail: {
        type: type,
        payload: payload,
      },
    });
    this.dispatchEvent(event);
  }
}

customElements.define("cluster-map", ClusterMap);
