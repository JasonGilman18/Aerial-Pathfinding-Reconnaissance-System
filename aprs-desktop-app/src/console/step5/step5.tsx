import React from 'react';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../console.css';
import './step5.css';
const {ipcRenderer} = window.require('electron');


interface Step5_Data {dataDownloaded: boolean, progressVal: string, progressMessage: string};

type Step5Props = {stepStatus: string, data: Step5_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any};
type Step5States = {stepStatus: string, data: Step5_Data, errorMsg: Array<string>};
class Step5 extends React.Component<Step5Props, Step5States>
{
    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Initiate the downloading of the aerial drone's flight data."]};

        this.download = this.download.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus, data: newProp.data});
    }

    async download()
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
                tempData.progressMessage = "Downloading Data...";
                this.setState({data: tempData});
                var downloaded = await this.downloadData();

                if(downloaded)
                {
                    var tempData = this.state.data;
                    tempData.progressVal = "100";
                    tempData.progressMessage = "Flight Data Downloaded";
                    tempData.dataDownloaded = true;
                    this.setState({data: tempData});
                }
                else
                {
                    this.props.func_onUpdateStepStatus(4, this.props.func_checkForErrors(this.state.data));
                    this.setState({errorMsg: ["Unable to download the flight data.", "Ensure that the aerial drone system is operational and within connection range."]});
                }
            }
            else
            {
                this.props.func_onUpdateStepStatus(4, this.props.func_checkForErrors(this.state.data));
                this.setState({errorMsg: ["Unable to establish connection to aerial drone.", "Ensure that the aerial drone system is operational and within connection range."]});
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(4, this.props.func_checkForErrors(this.props.data));
        }
    }

    async downloadData()
    {
        const response = await fetch('http://10.0.0.1:5000/download', {method: 'GET'});
        //const file = await response.blob();
        //console.log(file);

        ipcRenderer.send('save-video-data', response);

        return new Promise(resolve => {
            
            ipcRenderer.on('save-video-data', (event: any, arg: boolean) => {
            
                resolve(arg);
            });
        });
    }

    render()
    {
        return (

            <div id="consoleBox">
                <div className="consoleStep">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 5</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(4, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(4+1);this.props.func_onUpdateStepStatus(4+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
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
                        <h3 className="header_step">Download Flight Data From Aerial Drone</h3>
                        <div className="underline"></div>
                        <p>
                                In this step, you will download the data collected during the aerial drone's flight. The data will 
                                include short videos taken of the mapping area.
                        </p>
                        <p>
                                Make sure the aerial drone system is within range of your computer to ensure the proper downloading of the 
                                aerial drone's flight data.   
                        </p>
                        <div className="aerialDownloadBtnContainer">
                            <div onClick={this.download} className={this.state.data.dataDownloaded ? "hidden" : "aerialDownloadBtn"}><h6>Download Data</h6></div>
                            <progress className="aerialDownloadProgress" value={this.state.data.progressVal} max="100">{this.state.data.progressVal}</progress>
                            <h6>{this.state.data.progressMessage}</h6>
                        </div>
                    </Container>
                </div>
            </div>
        );        
    }
}

export default Step5;
export type {Step5_Data};