import React from 'react';
import {Container} from 'react-bootstrap';
import {Time} from './../console';
import 'bootstrap/dist/css/bootstrap.min.css';
import './../console.css';
import './step4.css';


interface Step4_Data {flightStarted: boolean, flightEnded: boolean, time: Time, finalTime: Time, seconds: number, progressVal: string, progressMessage: string};

type Step4Props = {stepStatus: string, data: Step4_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any, func_startTimer: any, func_stopTimer: any};
type Step4States = {stepStatus: string, data: Step4_Data, errorMsg: Array<string>};
class Step4 extends React.Component<Step4Props, Step4States>
{
    public interval: any;

    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Launch the aerial drone's data collection flight."]};

        this.interval = 0;

        this.launch = this.launch.bind(this);
        this.land = this.land.bind(this);
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
            tempData.progressMessage = "Establishing Connection to Aerial Drone...";
            this.setState({data: tempData});
            var connected = await this.props.func_connectToDrone();

            if(connected)
            {
                var tempData = this.state.data;
                tempData.progressVal = "50";
                tempData.progressMessage = "Launching Flight...";
                this.setState({data: tempData});
                var launched = await this.sendLaunch();

                if(launched)
                {
                    var tempData = this.state.data;
                    tempData.progressVal = "100";
                    tempData.progressMessage = "Flight Launched";
                    tempData.flightStarted = true;
                    this.setState({data: tempData, errorMsg: ["Confirm the aerial drone's landing."]});
                    this.props.func_startTimer();
                }
                else
                {
                    this.props.func_onUpdateStepStatus(3, this.props.func_checkForErrors(this.state.data));
                    this.setState({errorMsg: ["Unable to launch aerial drone's data collection flight.", "Ensure that the aerial drone system is operational and within connection range."]});
                }
            }
            else
            {
                this.props.func_onUpdateStepStatus(3, this.props.func_checkForErrors(this.state.data));
                this.setState({errorMsg: ["Unable to establish connection to aerial drone.", "Ensure that the aerial drone system is operational and within connection range."]});
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(3, this.props.func_checkForErrors(this.state.data));
        }
    }

    async land()
    {
        var landed = await this.props.func_connectToDrone();

        if(landed)
        {
            this.props.func_stopTimer();
            var tempData = this.state.data;
            tempData.flightEnded = true;
            this.setState({data: tempData});
        }
        else
        {
            this.props.func_onUpdateStepStatus(3, this.props.func_checkForErrors(this.state.data));
            this.setState({errorMsg: ["Unable to detect the drone's presence.", "Ensure that the aerial drone system is operational and within connection range."]});
        }
    }

    async sendLaunch()
    {
        const response = await fetch('http://10.0.0.1:5000/', {method: 'GET'});
        return response.status == 200;
    }

    render()
    {
        return (

            <div id="consoleBox">
                <div className="consoleStep">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 4</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(3, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(3+1);this.props.func_onUpdateStepStatus(3+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
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
                        <h3 className="header_step">Begin Data Collection Flight</h3>
                        <div className="underline"></div>
                        <p>
                                In this step, you will launch the aerial drone's flight. The drone will follow the previously sent instructions,
                                and return to its original starting position. Once the aerial drone has returned to its starting position, confirm and 
                                complete this step. 
                        </p>
                        <p>
                                Make sure the aerial drone system is within range of your computer to ensure the proper launching of the 
                                drone and confirmation that the system may proceed.   
                        </p>
                        <div className="aerialLaunchBtnContainer">
                            <div onClick={this.launch} className={this.state.data.flightStarted ? "hidden" : "aerialLaunchBtn"}><h6>Launch Drone</h6></div>
                            <div className={this.state.data.flightEnded ? "hidden" : (this.state.data.flightStarted ? "flightTimer" : "hidden")}><h6>Flight Duration: {this.state.data.time.hours < 10 ? "0"+this.state.data.time.hours : this.state.data.time.hours}:{this.state.data.time.minutes < 10 ? "0"+this.state.data.time.minutes : this.state.data.time.minutes}:{this.state.data.time.seconds < 10 ? "0"+this.state.data.time.seconds : this.state.data.time.seconds}</h6></div>
                            <div className={this.state.data.flightEnded ? "flightTimer" : "hidden"}><h6>Final Flight Duration: {this.state.data.finalTime.hours < 10 ? "0"+this.state.data.finalTime.hours : this.state.data.finalTime.hours}:{this.state.data.finalTime.minutes < 10 ? "0"+this.state.data.finalTime.minutes : this.state.data.finalTime.minutes}:{this.state.data.finalTime.seconds < 10 ? "0"+this.state.data.finalTime.seconds : this.state.data.finalTime.seconds}</h6></div>
                            <progress className={this.state.data.flightStarted ? "hidden" : "aerialLaunchProgress"} value={this.state.data.progressVal} max="100">{this.state.data.progressVal}</progress>
                            <h6 className={this.state.data.flightStarted ? "hidden" : ""}>{this.state.data.progressMessage}</h6>
                            <div onClick={this.land} className={this.state.data.flightEnded ? "hidden" : (this.state.data.flightStarted ? "aerialLaunchBtn land" : "hidden")}><h6>Confirm Landing</h6></div>
                        </div>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Step4;
export type {Step4_Data, Time};