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

    const dc = document.querySelector( "#dc" );
    const level1 = document.querySelector( "#level1" );
    const level2 = document.querySelector( "#level2" );

    function setAtts() {
        map.setAttribute( "filter", `${dc.checked},${level1.checked},${level2.checked}` );
    }

    setAtts();
    
    document.querySelectorAll("sl-switch").forEach((s) => {
        s.addEventListener( "sl-change", (e) => {
            setAtts();
        })
    });
});

