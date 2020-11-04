import React from 'react';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Leaflet, { LeafletMouseEvent } from 'leaflet';
import LeafMap from './leafletMap/leafletMap';
import './step2.css';


interface Step2_Data{coordinates: string, mapMarkers: Array<any>, showMap: boolean, latInput: string, lngInput: string, mapCenter: Array<any>, mapRectangles: Array<any>, createRectangle: boolean, locationTable: any, mappingArea: any};

type Step2Props = {stepStatus: string, data: Step2_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any};
type Step2State = {stepStatus: string, data: Step2_Data, errorMsg: Array<string>};
class Step2 extends React.Component<Step2Props, Step2State>
{
    private showMap: React.RefObject<HTMLInputElement>;
    private latInput: React.RefObject<HTMLInputElement>;
    private lngInput: React.RefObject<HTMLInputElement>;

    constructor(props: any)
    {
        super(props);

        this.showMap = React.createRef();
        this.latInput = React.createRef();
        this.lngInput = React.createRef();

        
        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Input your current location, and select a valid mapping area by clicking on the map."]};

        this.locationInput = this.locationInput.bind(this);
        this.lockInRectangle = this.lockInRectangle.bind(this);
        this.getCurrentLocation = this.getCurrentLocation.bind(this);
        this.setupMap = this.setupMap.bind(this);
        this.createRectangle = this.createRectangle.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus, data: newProp.data});
    }

    locationInput(e: React.FormEvent<HTMLInputElement>, i: string)
    {
        var tempData = this.state.data;
        var tempInput = e.currentTarget.value;

        if(i == "lat")
            tempData.latInput = tempInput;
        else
            tempData.lngInput = tempInput;
        
        this.setState({data: tempData});
    }

    async getCurrentLocation()
    {
        const apikey = process.env.REACT_APP_GOOGLE_API_KEY;
        const response = await fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=' + apikey, {method: 'POST'});

        if(response.status == 200)
        {
            var tempData = this.state.data;
            response.json().then(data => {

                tempData.latInput = data.location.lat;
                tempData.lngInput = data.location.lng;
                this.setState({data: tempData});
            });
        }
        else
        {
            this.props.func_onUpdateStepStatus(1, this.props.func_checkForErrors(this.state.data));
            this.setState({errorMsg: ["Unable to find your current location, plese manually enter your coordinates."]});
        }
    }

    setupMap()
    {
        var latInput = parseFloat(this.latInput.current!.value);
        var lngInput = parseFloat(this.lngInput.current!.value);

        if(!(isNaN(latInput) || isNaN(lngInput)) && latInput >= -90 && latInput <= 90 && lngInput >= -180 && lngInput <= 180)
        {
            var tempMarkers = this.state.data.mapMarkers;
            var tempData = this.state.data;
            tempMarkers.push({lat: latInput, lng: lngInput});
            tempData.mapMarkers = tempMarkers;
            tempData.showMap = true;
            tempData.mapCenter = [latInput, lngInput];

            this.setState({data: tempData, errorMsg: ["Click on the map to select a valid mapping area."]});
        }
        else
        {
            this.props.func_onUpdateStepStatus(1, this.props.func_checkForErrors(this.state.data));
            this.setState({errorMsg: ["Enter a valid current location."]});
        }
    }

    lockInRectangle(e: LeafletMouseEvent)
    {
        const current_loc = Leaflet.latLng(this.state.data.mapCenter[0], this.state.data.mapCenter[1]);
        const cursor_loc = Leaflet.latLng(e.latlng.lat, e.latlng.lng);
        var bounds = Leaflet.latLngBounds(current_loc, cursor_loc);

        var sw = bounds.getSouthWest();
        var nw = bounds.getNorthWest();
        var se = bounds.getSouthEast();

        var width = sw.distanceTo(se);
        var height = sw.distanceTo(nw);
        var area = width*height;

        if(area <= 1000000)
        {
            var tempData = this.state.data;
            tempData.createRectangle = false;
            tempData.mappingArea = bounds;

            this.setState({data: tempData});
            this.createRectangle(e);
        } 
    }

    createRectangle(e :LeafletMouseEvent)
    {
        const current_loc = Leaflet.latLng(this.state.data.mapCenter[0], this.state.data.mapCenter[1]);
        const cursor_loc = Leaflet.latLng(e.latlng.lat, e.latlng.lng);
        var bounds = Leaflet.latLngBounds(current_loc, cursor_loc);

        var sw = bounds.getSouthWest();
        var nw = bounds.getNorthWest();
        var se = bounds.getSouthEast();
        var ne = bounds.getNorthEast();

        var tempLocationTable = {currentLocation: "", currentLat: 0, currentLng: 0, location1: "", lat1: 0, lng1: 0, location2: "", lat2: 0, lng2: 0, location3: "", lat3: 0, lng3: 0};
        if(current_loc.lat == sw.lat && current_loc.lng == sw.lng)
            tempLocationTable = {currentLocation: "NE", currentLat: ne.lat, currentLng: ne.lng, location1: "SE", lat1: se.lat, lng1: se.lng, location2: "SW (Current)", lat2: sw.lat, lng2: sw.lng, location3: "NW", lat3: nw.lat, lng3: nw.lng};
        else if(current_loc.lat == nw.lat && current_loc.lng == nw.lng)
            tempLocationTable = {currentLocation: "NE", currentLat: ne.lat, currentLng: ne.lng, location1: "SE", lat1: se.lat, lng1: se.lng, location2: "SW", lat2: sw.lat, lng2: sw.lng, location3: "NW (Current)", lat3: nw.lat, lng3: nw.lng};
        else if(current_loc.lat == se.lat && current_loc.lng == se.lng)
            tempLocationTable = {currentLocation: "NE", currentLat: ne.lat, currentLng: ne.lng, location1: "SE (Current)", lat1: se.lat, lng1: se.lng, location2: "SW", lat2: sw.lat, lng2: sw.lng, location3: "NW", lat3: nw.lat, lng3: nw.lng};
        else if(current_loc.lat == ne.lat && current_loc.lng == ne.lng)
            tempLocationTable = {currentLocation: "NE (Current)", currentLat: ne.lat, currentLng: ne.lng, location1: "SE", lat1: se.lat, lng1: se.lng, location2: "SW", lat2: sw.lat, lng2: sw.lng, location3: "NW", lat3: nw.lat, lng3: nw.lng};

        var width = sw.distanceTo(se);
        var height = sw.distanceTo(nw);
        var area = width*height;
        
        var color = "";
        if(area > 1000000)
            color = "red";
        else
            color = "green";

        var tempData = this.state.data;
        tempData.mapRectangles = [[bounds, color]];
        tempData.locationTable = tempLocationTable;

        this.setState({data: tempData});
    }

    render()
    {
        return(

            <div id="consoleBox">
                <div className="consoleStep step2">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 2</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(1, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(1+1);this.props.func_onUpdateStepStatus(1+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
                    </Container>
                    <Container fluid className="bottomRow">
                        <div className={this.state.stepStatus == "error" ? "errorBox" : "hidden"}>
                            {
                                this.state.errorMsg.map(msg => (

                                    <h6>{msg}</h6>
                                ))
                            }
                        </div>
                        <div className={this.state.stepStatus == "prevError" ? "errorBox" : "hidden"}>
                            <h6>Complete all previous steps.</h6>
                        </div>
                        <h3 className="header_step">Select the Mapping Area</h3>
                        <div className="underline"></div>
                        <p>
                                In this step you will select the area to be mapped by the aerial drone. This area will dictate the 
                                possible paths for the autonomous land vehicle.
                        </p>
                        <p>
                                If you are connected to the internet you may click the button provided to get your current location.
                                Otherwise, you must enter the coordinates of your current location.
                                Then, click the add to map button to place the initial pin on the map.
                                Next, please plot the area to be mapped in the provided plot.
                                Click on the plot to place pins for the drone's flight.
                                You can view your plotted pins in the table below the map.
                        </p>
                        <p>
                                Upon completion, make sure your current location is reported and you have placed pins on the map. 
                        </p>
                        <div className={this.state.data.showMap?"hidden":"currentLocationCenter"}>
                            <div id="currentLocationFirst">
                                <div onClick={this.getCurrentLocation} id="currentLocationBtn"><h6>Get My Location</h6></div>
                                <h5 id="currentLocationDivider">or</h5>
                                <form id="currentLocationForm">
                                    <input ref={this.latInput} id="latInput" type="text" placeholder="Latitude:" onChange={(e) => this.locationInput(e, "lat")} value={this.state.data.latInput}></input>
                                    <input ref={this.lngInput} id="lngInput" type="text" placeholder="Longitude:" onChange={(e) => this.locationInput(e, "lng")} value={this.state.data.lngInput}></input>
                                </form>
                            </div>
                            <div ref={this.showMap} id="manualLocationSubmit" onClick={this.setupMap}><h6>Show Map</h6></div>
                        </div>
                        <div className={this.state.data.showMap?"locationTableCenter":"hidden"}>
                            <table className="locationTable">
                                <thead>
                                    <th className="firstCol">Boundary Location</th>
                                    <th className="otherCol">Latitude Value</th>
                                    <th className="otherCol">Longitude Value</th>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{this.state.data.locationTable.currentLocation}</td>
                                        <td>{this.state.data.locationTable.currentLat}</td>
                                        <td>{this.state.data.locationTable.currentLng}</td>
                                    </tr>
                                    <tr>
                                        <td>{this.state.data.locationTable.location1}</td>
                                        <td>{this.state.data.locationTable.lat1}</td>
                                        <td>{this.state.data.locationTable.lng1}</td>
                                    </tr>
                                    <tr>
                                        <td>{this.state.data.locationTable.location2}</td>
                                        <td>{this.state.data.locationTable.lat2}</td>
                                        <td>{this.state.data.locationTable.lng2}</td>
                                    </tr>
                                    <tr>
                                        <td>{this.state.data.locationTable.location3}</td>
                                        <td>{this.state.data.locationTable.lat3}</td>
                                        <td>{this.state.data.locationTable.lng3}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <LeafMap showMap={this.state.data.showMap} mapCenter={this.state.data.mapCenter} createRectangle={this.state.data.createRectangle} rectangles={this.state.data.mapRectangles} markers={this.state.data.mapMarkers} func_onMapHover={this.createRectangle.bind(this)} func_onMapClick={this.lockInRectangle.bind(this)}></LeafMap>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Step2;
export type {Step2_Data};