import React from 'react';
import {Container} from 'react-bootstrap';
import {Time} from './../console';
import 'bootstrap/dist/css/bootstrap.min.css';
import './../console.css';
import './step8.css';


interface Step8_Data {droneStarted: boolean, timerEnded: boolean, time: Time, finalTime: Time, seconds: number, progressVal: string, progressMessage: string};

type Step8Props = {stepStatus: string, data: Step8_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any, func_startTimer: any, func_stopTimer: any};
type Step8States = {stepStatus: string, data: Step8_Data, errorMsg: Array<string>};
class Step8 extends React.Component<Step8Props, Step8States>
{
    public interval: any;

    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Launch the land drone's excursion."]};

        this.interval = 0;

        this.launch = this.launch.bind(this);
        this.end = this.end.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus, data: newProp.data});
    }

    async launch()
    {
        if(this.props.func_checkForErrors(this.state.data) != "prevError")
        {
            var tempData = this.state.data;
            tempData.progressVal = "0";
            tempData.progressMessage = "Establishing Connection to Land Drone...";
            this.setState({data: tempData});
            var connected = await this.props.func_connectToDrone();

            if(connected)
            {
                var tempData = this.state.data;
                tempData.progressVal = "50";
                tempData.progressMessage = "Launching Excursion...";
                this.setState({data: tempData});
                var launched = await this.sendLaunch();

                if(launched)
                {
                    var tempData = this.state.data;
                    tempData.progressVal = "100";
                    tempData.progressMessage = "Land Drone Launched";
                    tempData.droneStarted = true;
                    this.setState({data: tempData, errorMsg: [""]});
                    this.props.func_startTimer(false);
                }
                else
                {
                    this.props.func_onUpdateStepStatus(7, this.props.func_checkForErrors(this.state.data));
                    this.setState({errorMsg: ["Unable to launch land drone's excursion.", "Ensure that the land drone system is operational and within connection range."]});
                }
            }
            else
            {
                this.props.func_onUpdateStepStatus(7, this.props.func_checkForErrors(this.state.data));
                this.setState({errorMsg: ["Unable to establish connection to land drone.", "Ensure that the land drone system is operational and within connection range."]});
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(3, this.props.func_checkForErrors(this.state.data));
        }
    }

    async sendLaunch()
    {
        const response = await fetch('http://10.0.0.1:5000/', {method: 'GET'});
        return response.status == 200;
    }

    end()
    {
        this.props.func_stopTimer(false);
        var tempData = this.state.data;
        tempData.timerEnded = true;
        this.setState({data: tempData});
    }

    render()
    {
        return (

            <div id="consoleBox">
                <div className="consoleStep">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 8</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(7, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                    </Container>
                    <Container fluid className="bottomRow">
                        <div className={this.state.stepStatus == "error" ? "errorBox" : "hidden"}>
                            {
                                this.state.errorMsg.map(msg => {
                                    
                                    if(msg != "")
                                        return <h6>{msg}</h6>
                                })
                            }
                        </div>
                        <div className={this.state.stepStatus == "prevError" ? "errorBox" : "hidden"}>
                            <h6>Complete all previous steps.</h6>
                        </div>
                        <h3 className="header_step">Begin Land Drone Excursion</h3>
                        <div className="underline"></div>
                        <p>
                                In this step, you will launch the land drone's excursion. The drone will follow the previously sent instructions.
                                Once the land drone has finished it's path, stop the timer. 
                        </p>
                        <p>
                                Make sure the land drone system is within range of your computer to ensure the proper launching of the 
                                drone and confirmation that the system may proceed.   
                        </p>
                        <div className="aerialLaunchBtnContainer">
                            <div onClick={this.launch} className={this.state.data.droneStarted ? "hidden" : "aerialLaunchBtn"}><h6>Launch Drone</h6></div>
                            <div className={this.state.data.timerEnded ? "hidden" : (this.state.data.droneStarted ? "flightTimer" : "hidden")}><h6>Flight Duration: {this.state.data.time.hours < 10 ? "0"+this.state.data.time.hours : this.state.data.time.hours}:{this.state.data.time.minutes < 10 ? "0"+this.state.data.time.minutes : this.state.data.time.minutes}:{this.state.data.time.seconds < 10 ? "0"+this.state.data.time.seconds : this.state.data.time.seconds}</h6></div>
                            <div className={this.state.data.timerEnded ? "flightTimer" : "hidden"}><h6>Final Excursion Duration: {this.state.data.finalTime.hours < 10 ? "0"+this.state.data.finalTime.hours : this.state.data.finalTime.hours}:{this.state.data.finalTime.minutes < 10 ? "0"+this.state.data.finalTime.minutes : this.state.data.finalTime.minutes}:{this.state.data.finalTime.seconds < 10 ? "0"+this.state.data.finalTime.seconds : this.state.data.finalTime.seconds}</h6></div>
                            <progress className={this.state.data.droneStarted ? "hidden" : "aerialLaunchProgress"} value={this.state.data.progressVal} max="100">{this.state.data.progressVal}</progress>
                            <h6 className={this.state.data.droneStarted ? "hidden" : ""}>{this.state.data.progressMessage}</h6>
                            <div onClick={this.end} className={this.state.data.timerEnded ? "hidden" : (this.state.data.droneStarted ? "aerialLaunchBtn land" : "hidden")}><h6>Stop Timer</h6></div>
                        </div>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Step8;
export type {Step8_Data, Time};