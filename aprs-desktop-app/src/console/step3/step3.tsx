import React from 'react';
import {Container} from 'react-bootstrap';
import Leaflet, { Bounds, LatLngBounds } from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import './../console.css';
import './step3.css';


interface Step3_Data {progressVal: string, progressMessage: string, finishedUpload: boolean};

type Step3Props = {stepStatus: string, data: Step3_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any, mappingArea: any};
type Step3State = {stepStatus: string, data: Step3_Data, errorMsg: Array<string>};
class Step3 extends React.Component<Step3Props, Step3State>
{
    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Initiate the uploading of instructions to the aerial drone."]};

        this.upload = this.upload.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus, data: newProp.data});
    }

    async upload()
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
                tempData.progressMessage = "Sending Navigation Instructions...";
                this.setState({data: tempData});
                var sent = await this.sendInstructions();

                if(sent)
                {
                    var tempData = this.state.data;
                    tempData.progressVal = "100";
                    tempData.progressMessage = "Navigation Instructions Uploaded";
                    tempData.finishedUpload = true;
                    this.setState({data: tempData});
                }
                else
                {
                    this.props.func_onUpdateStepStatus(2, this.props.func_checkForErrors(this.state.data));
                    this.setState({errorMsg: ["Unable to upload navigation instructions.", "Ensure that the aerial drone system is operational and within connection range."]});
                }
            }
            else
            {
                this.props.func_onUpdateStepStatus(2, this.props.func_checkForErrors(this.state.data));
                this.setState({errorMsg: ["Unable to establish connection to aerial drone.", "Ensure that the aerial drone system is operational and within connection range."]});
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(2, this.props.func_checkForErrors(this.state.data));
        }
    }

    async sendInstructions()
    {
        const mappingArea = this.props.mappingArea;
        const response = await fetch('http://10.0.0.1:5000/uploadInstructions', {method: 'POST', body: JSON.stringify({nav: mappingArea})});
        return response.status == 200;
    }

    render()
    {
        return(

            <div id="consoleBox">
                <div className="consoleStep">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 3</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(2, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(2+1);this.props.func_onUpdateStepStatus(2+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
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
                        <h3 className="header_step">Upload Navigation Instructions to Aerial Drone</h3>
                        <div className="underline"></div>
                        <p>
                                In this step, you will upload the navigation instructions to the aerial drone system. These instructions 
                                have been compiled in the previous step, based on your map selection. 
                        </p>
                        <p>
                                Make sure the aerial drone system is within range of your computer to ensure the proper uploading of the 
                                navigation instructions. 
                        </p>
                        <div className="uploadBtnContainer">
                            <div onClick={this.upload} className={this.state.data.finishedUpload ? "hidden" : "uploadBtn"}><h6>Upload</h6></div>
                        </div>
                        <div className="aerialUploadCenter">
                            <progress className="aerialUploadProgress" value={this.state.data.progressVal} max="100">{this.state.data.progressVal}</progress>
                            <h6>{this.state.data.progressMessage}</h6>
                        </div>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Step3;
export type {Step3_Data};