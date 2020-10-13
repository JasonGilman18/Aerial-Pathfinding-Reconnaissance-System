import React from 'react';
import ReactDOM from 'react-dom';
import {Container, Row} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './console.css';
import LeafMap from '../leafletMap/leafletMap';
import Leaflet, { LeafletMouseEvent } from 'leaflet';



type ConsoleProps = {display: number, onUpdateStepStatus: any, stepStatus: Array<string>, onNextButtonClick: any};
type ConsoleStates = {display: number, coordinates: string, mapMarkers: Array<any>};
class Console extends React.Component<ConsoleProps, ConsoleStates>
{
    //private coordinateInput: React.RefObject<HTMLInputElement>;

    constructor(props: any)
    {
        super(props);
        //this.coordinateInput = React.createRef();
        this.state = {display: this.props.display, coordinates: "", mapMarkers: []};
        this.updateMarkers = this.updateMarkers.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        if(this.state.display != newProp.display)
        {
            this.setState({display: newProp.display});
        }
    }

    /*
    pullCoordinates()
    {
        var inputVal = this.coordinateInput.current!.value;
        console.log(inputVal);
        this.setState({coordinates: inputVal});
    }
    */

    updateMarkers(e: LeafletMouseEvent)
    {
        var temp = this.state.mapMarkers;
        temp.push(e.latlng);
        console.log(e.latlng);
        this.setState({mapMarkers: temp});
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
                                <br></br>
                                <br></br>
                                To ensure proper operation of the system, please follow the instructions listed below.
                            </p>
                            <h3 className="header_step">Instructions</h3>
                            <div className="underline"></div>
                            <p>
                                This software UI is split into several sections: the main box, steps box, navigation box, and console box.
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
                                    <table id="statusColorTable">
                                        <thead>
                                            <th>Status Color</th>
                                            <th>Meaning</th>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{backgroundColor: "blue"}}></td>
                                                <td>In Progress</td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: "green"}}></td>
                                                <td>Complete</td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: "#444e55"}}></td>
                                                <td>Incomplete</td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: "red"}}></td>
                                                <td>Error</td>
                                            </tr>
                                        </tbody>
                                    </table>
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
                            <LeafMap markers={this.state.mapMarkers} onMapClick={this.updateMarkers.bind(this)}></LeafMap>
                            {this.state.mapMarkers.map((position) =>
                                <p>{"Lat: " + position.lat + " Lng: " + position.lng}</p>
                            )}
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