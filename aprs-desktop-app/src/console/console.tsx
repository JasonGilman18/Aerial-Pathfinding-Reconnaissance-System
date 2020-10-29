import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import {Container, Row} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './console.css';
import LeafMap from '../leafletMap/leafletMap';
import Leaflet, { LeafletMouseEvent } from 'leaflet';
import {ReactComponent as ExitLogo} from './img/times-circle-regular.svg';



type ConsoleProps = {display: number, onUpdateStepStatus: any, stepStatus: Array<string>, onNextButtonClick: any};
type ConsoleStates = {stepStatus: Array<string>, display: number, coordinates: string, mapMarkers: Array<any>, showMap: boolean, latInput: any, lngInput: any, mapCenter: any, mapRectangles: Array<any>, createRectangle: boolean, locationTable: any, mappingArea: any};
class Console extends React.Component<ConsoleProps, ConsoleStates>
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

        this.state = {stepStatus: this.props.stepStatus, display: this.props.display, coordinates: "", mapMarkers: [], showMap: false, latInput: "", lngInput: "", mapCenter: [], mapRectangles: [], createRectangle: true, locationTable: {}, mappingArea: ""};
        this.lockInRectangle = this.lockInRectangle.bind(this);
        this.getCurrentLocation = this.getCurrentLocation.bind(this);
        this.setupMap = this.setupMap.bind(this);
        this.createRectangle = this.createRectangle.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        if(this.state.display != newProp.display)
        {
            this.setState({stepStatus: newProp.stepStatus, display: newProp.display});
        }
        this.setState({stepStatus: newProp.stepStatus});
    }

    async getCurrentLocation()
    {
        const apikey = process.env.REACT_APP_GOOGLE_API_KEY;
        const response = await fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=' + apikey, {method: 'POST'}).then(res => res.json());
        this.setState({latInput: response.location.lat, lngInput: response.location.lng});
    }

    setupMap()
    {
        var latInput = this.latInput.current!.value;
        var lngInput = this.lngInput.current!.value;
        var tempMarkers = this.state.mapMarkers;
        tempMarkers.push({lat: latInput, lng: lngInput});
        this.setState({mapMarkers: tempMarkers, showMap: true, mapCenter: [latInput, lngInput]});
    }

    lockInRectangle(e: LeafletMouseEvent)
    {
        const current_loc = Leaflet.latLng(this.state.mapCenter[0], this.state.mapCenter[1]);
        const cursor_loc = Leaflet.latLng(e.latlng.lat, e.latlng.lng);
        var bounds = Leaflet.latLngBounds(current_loc, cursor_loc);

        this.setState({createRectangle: false, mappingArea: bounds});
        this.createRectangle(e);
    }

    createRectangle(e :LeafletMouseEvent)
    {
        const current_loc = Leaflet.latLng(this.state.mapCenter[0], this.state.mapCenter[1]);
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

        this.setState({mapRectangles: [[bounds, color]], locationTable: tempLocationTable});
    }

    checkPreviousStepCompletion(i: number)
    {
        if(i == 0)
            return true;
        else
        {
            for(var index=0;index<i;index++)
            {
                if(this.props.stepStatus[index] != "complete")
                    return false;
            }

            return true;
        }
    }

    checkForErrors()
    {
        var stepDisplayed = this.state.display;
        
        if(this.checkPreviousStepCompletion(stepDisplayed))
        {
            switch(stepDisplayed)
            {
                case 0:
                    return "complete";

                case 1:
                    if(this.state.mappingArea == "")
                    {
                        return "error";
                    }
                    else
                        return "complete";
            }
        }
        else
            return "error";
    }

    render()
    {
        if(this.state.display==0)
        {
            return (
            
                <div id="consoleBox">
                    <div className="consoleStep step1">
                        <Container fluid className="topRow">
                            <h1 className="stepHeader">Step 1</h1>
                            <div className="completeBtn" onClick={() => this.props.onUpdateStepStatus(0, this.checkForErrors())}><h6>Complete</h6></div>
                            <div onClick={() => {this.props.onNextButtonClick(0+1);this.props.onUpdateStepStatus(0+1, "inprogress")}} className={this.props.stepStatus[0]=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
                        </Container>
                        <Container fluid className="bottomRow">
                            <h3 className="header_step">Welcome</h3>
                            <div className="underline"></div>
                            <p>
                                This software will serve as the controller for the Aerial Pathfinding Reconnaissance System. You will
                                be able to input, start, and suspend the various devices contained within the APRS. The APRS requires 
                                that the aerial and land drones are within distance so that a wifi signal can be recieved by this software.
                            </p>
                            <p>    
                                To ensure proper operation of the system, please follow the instructions listed below.
                            </p>
                            <h3 className="header_step">Instructions</h3>
                            <div className="underline"></div>
                            <p>
                                This UI software is split into several sections: the main box, steps box, navigation box, and console box.
                            </p>
                            <ul>
                                <li>
                                    The main box is the section you are reading this in. This is where you will prepare the necessary inputs for
                                    each step. If an error were to occur on any step, you will find the specific error message displayed in this
                                    section.
                                </li>
                                <li>
                                    The steps box is displayed to the left of the main box. It contains all of the steps for operating the APRS.
                                    On each step, you can see the description and status of the step.
                                    <div id="centerTable">
                                        <table id="statusColorTable">
                                            <thead>
                                                <th>Status Color</th>
                                                <th>Meaning</th>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{backgroundColor: "#3865a3"}}></td>
                                                    <td>In Progress</td>
                                                </tr>
                                                <tr>
                                                    <td style={{backgroundColor: "#64a338"}}></td>
                                                    <td>Complete</td>
                                                </tr>
                                                <tr>
                                                    <td style={{backgroundColor: "#444e55"}}></td>
                                                    <td>Incomplete</td>
                                                </tr>
                                                <tr>
                                                    <td style={{backgroundColor: "#e03b24"}}></td>
                                                    <td>Error</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    Upon clicking on any of the steps, the step will open in the main box.
                                </li>
                                <li>
                                    The navigation box is displayed directly above the main box. Here you will find the label for the step that is currently open
                                    in the main box. A button is availible in this box to complete the step. On steps that require uploading, downloading, or sending
                                    drones on excursions, the button will contain a specific label pertaining to this event. Upon clicking the button, the step will compile
                                    and produce an output in the console box, and update the step's status in the steps box. If the step compiled without errors,
                                    a second button will appear labeled "Next Step". Upon clicking on this button, the following step will be displayed.
                                </li>
                                <li>
                                    The console box is displayed in the bottom left of the UI. Here you will find messages pertaining to step status.
                                </li>
                            </ul>
                        </Container>
                    </div>
                </div>
            );
        }
        else if(this.state.display==1)
        {
            return (

                <div id="consoleBox">
                    <div className="consoleStep step2">
                        <Container fluid className="topRow">
                            <h1 className="stepHeader">Step 2</h1>
                            <div className="completeBtn" onClick={() => this.props.onUpdateStepStatus(1, this.checkForErrors())}><h6>Complete</h6></div>
                            <div onClick={() => {this.props.onNextButtonClick(1+1);this.props.onUpdateStepStatus(1+1, "inprogress")}} className={this.props.stepStatus[1]=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
                        </Container>
                        <Container fluid className="bottomRow">
                            <div className={this.props.stepStatus[1] == "error" ? "errorBox" : "hidden"}>
                                <h6>Input your current location, select the mapping area, and click to lock in your selection.</h6>
                                <ExitLogo className="exitLogo" onClick={() => this.props.onUpdateStepStatus(1, "inprogress")}></ExitLogo>
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
                            <div className={this.state.showMap?"hidden":"currentLocationCenter"}>
                                <div id="currentLocationFirst">
                                    <div onClick={this.getCurrentLocation} id="currentLocationBtn"><h6>Get My Location</h6></div>
                                    <h5 id="currentLocationDivider">or</h5>
                                    <form id="currentLocationForm">
                                        <input ref={this.latInput} id="latInput" type="text" placeholder="Latitude:" value={this.state.latInput}></input>
                                        <input ref={this.lngInput} id="lngInput" type="text" placeholder="Longitude:" value={this.state.lngInput}></input>
                                    </form>
                                </div>
                                <div ref={this.showMap} id="manualLocationSubmit" onClick={this.setupMap}><h6>Show Map</h6></div>
                            </div>
                            <div className={this.state.showMap?"locationTableCenter":"hidden"}>
                                <table className="locationTable">
                                    <thead>
                                        <th className="firstCol">Boundary Location</th>
                                        <th className="otherCol">Latitude Value</th>
                                        <th className="otherCol">Longitude Value</th>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{this.state.locationTable.currentLocation}</td>
                                            <td>{this.state.locationTable.currentLat}</td>
                                            <td>{this.state.locationTable.currentLng}</td>
                                        </tr>
                                        <tr>
                                            <td>{this.state.locationTable.location1}</td>
                                            <td>{this.state.locationTable.lat1}</td>
                                            <td>{this.state.locationTable.lng1}</td>
                                        </tr>
                                        <tr>
                                            <td>{this.state.locationTable.location2}</td>
                                            <td>{this.state.locationTable.lat2}</td>
                                            <td>{this.state.locationTable.lng2}</td>
                                        </tr>
                                        <tr>
                                            <td>{this.state.locationTable.location3}</td>
                                            <td>{this.state.locationTable.lat3}</td>
                                            <td>{this.state.locationTable.lng3}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <LeafMap showMap={this.state.showMap} mapCenter={this.state.mapCenter} createRectangle={this.state.createRectangle} rectangles={this.state.mapRectangles} markers={this.state.mapMarkers} onMapHover={this.createRectangle.bind(this)} onMapClick={this.lockInRectangle.bind(this)}></LeafMap>
                        </Container>
                    </div>
                </div>
            );
        }
        else if(this.state.display==2)
        {
            return (
                
                <div id="consoleBox">
                    <div className="consoleStep step3">
                        step3
                    </div>
                </div>
            );
        }
        else if(this.state.display==3)
        {
            return (
                
                <div id="consoleBox">
                    <div className="consoleStep step4">
                        step4
                    </div>
                </div>
            );
        }
        else if(this.state.display==4)
        {
            return (
                
                <div id="consoleBox">
                    <div className="consoleStep step5">
                        step5
                    </div>
                </div>
            );
        }
        else if(this.state.display==5)
        {
            return (
                
                <div id="consoleBox">
                    <div className="consoleStep step6">
                        step6
                    </div>
                </div>
            );
        }
        else if(this.state.display==6)
        {
            return (
                
                <div id="consoleBox">
                    <div className="consoleStep step7">
                        step7
                    </div>
                </div>
            );
        }
        else if(this.state.display==7)
        {
            return (
                
                <div id="consoleBox">
                    <div className="consoleStep step8">
                        step8
                    </div>
                </div>
            );
        }
    }
}

export default Console;