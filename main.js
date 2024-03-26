import '@unocss/reset/tailwind.css';
import './main.css';
import '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/themes/light.css';

window.addEventListener('load', (event) => {
    const map = document.querySelector( "cluster-map" );
    
    const location = document.querySelector( 'location-lookup' )
    location.addEventListener( 'location', (e) => {
        const latlon = `${e.detail.lat},${e.detail.lon}`
        
        map.setAttribute( "latlon", latlon );
    })

    const connectors = document.querySelector( '#connectors' )
    connectors.addEventListener( 'sl-change', (e) => {
        map.setAttribute( "connectors", connectors.value );
    })

});

