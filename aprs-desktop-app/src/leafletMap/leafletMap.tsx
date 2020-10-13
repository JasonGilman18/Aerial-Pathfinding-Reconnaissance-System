import React from 'react';
import ReactDOM from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import {Container, Row} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Leaflet, { LeafletMouseEvent, divIcon } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leafletMap.css';
import pinIcon from './icons/pin.png';

type LeafMapProps = {onMapClick: any, markers: Array<any>};
type LeafMapStates = {};
class LeafMap extends React.Component<LeafMapProps, LeafMapStates>
{
    constructor(props: any)
    {
        super(props);
        //this.addMarker = this.addMarker.bind(this);
    }

    /*
    addMarker(e: LeafletMouseEvent)
    {
        this.props.markers.push(e.latlng);
        console.log(e.latlng);
    }
    */

    render() 
    {
        const iconMarkup = renderToStaticMarkup(<img id="markerIcon" src={pinIcon}/>);
        const customMarkerIcon = divIcon({
            html: iconMarkup,
        });

        return (
            
            <Map id="mapid" onClick={this.props.onMapClick()} center={[30.6188, -96.3365]} zoom={8}>
                <TileLayer url="http://localhost:5000/map/{z}/{x}/{y}"/>
                {this.props.markers.map((position) =>
                    <Marker icon={customMarkerIcon} position={position}></Marker>
                )}
            </Map>

        );
    }
}

export default LeafMap;