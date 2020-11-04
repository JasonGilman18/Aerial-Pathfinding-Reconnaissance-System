import React from 'react';
import ReactDOM from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import Leaflet, { LeafletMouseEvent, divIcon } from 'leaflet';
import { Map, TileLayer, Marker, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leafletMap.css';
import pinIcon from './icons/pin.png';

type LeafMapProps = {func_onMapClick: any, func_onMapHover: any, markers: Array<any>, showMap: boolean, mapCenter: any, rectangles: any, createRectangle: boolean};
type LeafMapStates = {showMap: boolean, mapCenter: any};
class LeafMap extends React.Component<LeafMapProps, LeafMapStates>
{
    constructor(props: any)
    {
        super(props);
        this.state = {showMap: this.props.showMap, mapCenter: [30.6188, -96.3365]};
    }

    componentWillReceiveProps(newProp: any)
    {
        if(newProp.mapCenter.length > 0)
            this.setState({showMap: newProp.showMap, mapCenter: newProp.mapCenter});
        else
            this.setState({showMap: newProp.showMap});
    }

    render() 
    {
        const iconMarkup = renderToStaticMarkup(<img id="markerIcon" src={pinIcon}/>);
        const customMarkerIcon = divIcon({
            html: iconMarkup,
            iconAnchor: Leaflet.point(12.5, 40)
        });

        if(this.state.showMap)
        {

            if(this.props.createRectangle)
            {
                return (
            
                    <Map id="mapid" onmousemove={(e: LeafletMouseEvent) => this.props.func_onMapHover(e)} onClick={(e: LeafletMouseEvent) => this.props.func_onMapClick(e)} center={this.state.mapCenter} zoom={14} maxZoom={14}>
                        <TileLayer url="http://localhost:5000/map/{z}/{x}/{y}"/>
                        {
                            this.props.markers.map((position) =>
                                <Marker icon={customMarkerIcon} position={position}></Marker>
                            )
                        }
                        {
                            this.props.rectangles.map((rectangle: Array<any>) =>
                                <Rectangle bounds={rectangle[0]} color={rectangle[1]}></Rectangle>
                            )   
                        }
                    </Map>
        
                );
            }
            else
            {
                return (

                    <Map id="mapid" center={this.state.mapCenter} zoom={14} maxZoom={14}>
                        <TileLayer url="http://localhost:5000/map/{z}/{x}/{y}"/>
                        {
                            this.props.markers.map((position) =>
                                <Marker icon={customMarkerIcon} position={position}></Marker>
                            )
                        }
                        {
                            this.props.rectangles.map((rectangle: Array<any>) =>
                                <Rectangle bounds={rectangle[0]} color={rectangle[1]}></Rectangle>
                            )   
                        }
                    </Map>
                    
                );
            }
        }
        else
        {
            return (<h2>loading...</h2>);
        }

    }
}

export default LeafMap;