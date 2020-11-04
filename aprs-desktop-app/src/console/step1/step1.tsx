import React from 'react';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './step1.css';


type Step1Props = {stepStatus: string, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any};
type Step1State = {stepStatus: string};
class Step1 extends React.Component<Step1Props, Step1State>
{
    constructor(props: any)
    {
        super(props);
        this.state = {stepStatus: this.props.stepStatus};
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus});
    }

    render()
    {
        return (

            <div id="consoleBox">
                <div className="consoleStep step1">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 1</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(0, this.props.func_checkForErrors())}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(0+1);this.props.func_onUpdateStepStatus(0+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
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
        )
    }
}

export default Step1;