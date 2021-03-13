import React from 'react';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './../console.css';
import './step7.css';


interface Step7_Data {progressVal: string, progressMessage: string, finishedUpload: boolean};

type Step7Props = {stepStatus: string, data: Step7_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any, navInstructions: any};
type Step7State = {stepStatus: string, data: Step7_Data, errorMsg: Array<string>};
class Step7 extends React.Component<Step7Props, Step7State>
{
    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Initiate the uploading of instructions to the land drone."]};

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
            tempData.progressMessage = "Establishing Connection to Land Drone...";
            this.setState({data: tempData});
            var connected = await this.props.func_connectToDrone();

            if(connected)
            {
                var tempData = this.state.data;
                tempData.progressVal = "50";
                tempData.progressMessage = "Uploading Instructions to Land Drone...";
                this.setState({data: tempData});
                var uploaded = await this.sendInstructions();

                if(uploaded)
                {
                    var tempData = this.state.data;
                    tempData.progressVal = "100";
                    tempData.progressMessage = "Instructions Uploaded";
                    tempData.finishedUpload = true;
                    this.setState({data: tempData});
                }
                else
                {
                    this.props.func_onUpdateStepStatus(6, this.props.func_checkForErrors(this.state.data));
                    this.setState({errorMsg: ["Unable to launch aerial drone's data collection flight.", "Ensure that the aerial drone system is operational and within connection range."]});
                }
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(6, this.props.func_checkForErrors(this.state.data));
        }
    }

    async sendInstructions()
    {
        //const response = await fetch('http://10.0.0.1:5000/uploadInstructions', {method: 'POST', body: JSON.stringify({nav: mappingArea}), headers: {'Content-Type': 'application/json; charset=UTF-8'}});
        const response = await fetch('http://192.168.50.1:5000/', {method: 'POST', body: JSON.stringify({nav: this.props.navInstructions}), headers: {'Content-Type': 'application/json; charset=UTF-8'}});
        return response.status == 200;
    }

    render()
    {
        return(

            <div id="consoleBox">
                <div className="consoleStep">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 7</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(6, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(6+1);this.props.func_onUpdateStepStatus(6+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
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
                        <h3 className="header_step">Upload Navigation Instructions to Land Drone</h3>
                        <div className="underline"></div>
                        <p>
                                In this step, you will upload the navigation instructions to the land drone system. These instructions 
                                have been compiled in the previous step.
                        </p>
                        <p>
                                Make sure the land drone system is within range of your computer to ensure the proper uploading of the 
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

export default Step7;
export type {Step7_Data};