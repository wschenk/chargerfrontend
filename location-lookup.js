import Openrouteservice from 'openrouteservice-js'
import apiKey from './apiKey.js'

// So we don't do a zillion searches
export function debounce(func, timeout = 500){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const Geocode = new Openrouteservice.Geocode({
    api_key: apiKey
})

class LocationLookup extends HTMLElement {
    connectedCallback() {
        const text = this.getAttribute( 'prompt' ) || "Location Search";
        
        this.insertAdjacentHTML( 'beforeend', `
          <form>
            <sl-input id="location" label="Where are you?"></sl-input>
            <sl-select open></sl-select>
          </form>
`);
        this.location = this.querySelector( '#location' );

        const processChange = debounce(() => this.lookupLocation());    
        this.location.addEventListener( 'keyup', processChange );

        this.results = this.querySelector( 'sl-select' );
        this.results.addEventListener( "click", this.clickEvent );
    }

    async lookupLocation() {
        this.networkEvent( "location:start" );
        const json = await Geocode.geocode( {text: this.location.value} )

        this.networkEvent( "location:end", json.features.length );

        this.results.innerHTML = ""
        for( let i = 0; i < json.features.length; i++ ) {
            const feature = json.features[i];
            this.results.innerHTML += `
<sl-option
    data-lat="${feature.geometry.coordinates[1]}"
    data-lon="${feature.geometry.coordinates[0]}"
>${feature.properties.label}</sl-option>`
        }

        this.results.show();
    }

    clickEvent( event ) {
        let location = event.target.dataset;
        const myevent = new CustomEvent("location", {
            bubbles: true,
            detail: location
        });
        this.dispatchEvent( myevent );
    }

    networkEvent( type, payload ) {
        let event = new CustomEvent( "network", {
            bubbles: true,
            detail: {
                type: type,
                payload: payload
            } } );
        this.dispatchEvent(event);
    }
}

customElements.define( 'location-lookup', LocationLookup )
