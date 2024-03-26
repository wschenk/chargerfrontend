const CHARGEMAP_URL = import.meta.env.VITE_CHARGEMAP_URL;

class NetworkStatus extends HTMLElement {
    connectedCallback() {
        this.status = {}
        this.render();

        this.dbstatus();
        document.addEventListener( 'network', (e) => this.receiveNetworkEvent(e) );
    }

    receiveNetworkEvent( event ) {
        console.log( event );
        console.log( event.detail );
        if( event.detail.type == 'location:start' ) {
            this.status['loading'] = true;
        }

        if( event.detail.type == 'location:end' ) {
            this.status['loading'] = false
            this.status['locations'] = event.detail.payload
        }

        if( event.detail.type == 'markers:start' ) {
            this.status['loading'] = true;
        }

        if( event.detail.type == 'markers:end' ) {
            this.status['loading'] = false;
            let p = event.detail.payload;
            this.status['markers'] = p.total;
            this.status['tesla'] = p.tesla;
            this.status['j1772'] = p.j1772;
            this.status['j1772combo'] = p.j1772combo;

        }
            

        this.render();
    }

    dbstatus() {
        fetch( `${CHARGEMAP_URL}/status` )
            .then( (response) => response.json() )
            .then( (json) => {
                console.log( "Response", json );
                this.status['count'] = json.count
                this.status['date'] = json.date_last_confirmed;
                this.status['tesla'] = json.tesla;
                this.status['j1772'] = json.j1772;
                this.status['j1772combo'] = json.j1772combo;
                this.render();
            })
    }

    render() {
        let s = this.status

        let h = ""

        if( s['loading'] == true ) {
            h += '<sl-spinner></sl-spinner>';
        }

        h = this.addNumber( 'Count', s['count'], h )
        h = this.addString( 'Date', s['date'], h );
        h = this.addNumber( 'Telsa', s['tesla'], h )
        h = this.addNumber( 'J1772', s['j1772'], h )
        h = this.addNumber( 'CCS', s['j1772combo'], h )
        h = this.addNumber( 'Locations', s['locations'], h );
        h = this.addNumber( 'Chargers', s['markers'], h );

        this.innerHTML = h;
    }

    addNumber( name, val, h ) {
        if( val ) {
            h += `<p pt-2>${name}: <sl-format-number value="${val}"></sl-format></p>`;
        } else {
            h += `<p pt-2>${name}: na</p>`;
        }

        return h;
    }
    
    addString( name, val, h ) {
        if( val ) {
            h += `<p pt-2>${name}: ${val}</p>`;
        } else {
            h += `<p pt-2>${name}: na</p>`;
        }

        return h;
    }

}

customElements.define( 'network-status', NetworkStatus )
