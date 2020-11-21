import React from 'react';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './../console.css';
import './step6.css';


interface Step6_Data {progressVal: string, progressMessage: string, finishedAnalysis: boolean};

type Step6Props = {stepStatus: string, data: Step6_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any};
type Step6State = {stepStatus: string, data: Step6_Data, errorMsg: Array<string>};
class Step6 extends React.Component<Step6Props, Step6State>
{
    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Initiate the software analysis of the data collected by the aerial drone."]};

        this.analyze = this.analyze.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus, data: newProp.data});
    }

    async analyze()
    {
        if(this.props.func_checkForErrors(this.state.data) != "prevError")
        {
            var tempData = this.state.data;
            tempData.progressVal = "0";
            tempData.progressMessage = "Setting up processes...";
            this.setState({data: tempData});

            const response = await fetch("localhost:5000/analyze", {method: 'GET'});
            if(response.status == 200)
            {
                var tempData = this.state.data;
                tempData.progressVal = "100";
                tempData.progressMessage = "Software Analysis Complete";
                tempData.finishedAnalysis = true;
                this.setState({data: tempData});
            }
            else
            {
                this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
                this.setState({errorMsg: ["Unable to finish software analysis"]});
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
        }
    }

    render()
    {
        return(

            <div id="consoleBox">
                <div className="consoleStep">
                    <Container fluid className="topRow">
                        <h1 className="stepHeader">Step 6</h1>
                        <div className="completeBtn" onClick={() => this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data), true)}><h6>Complete</h6></div>
                        <div onClick={() => {this.props.func_onNextButtonClick(5+1);this.props.func_onUpdateStepStatus(5+1, "inprogress")}} className={this.state.stepStatus=="complete" ? "nextBtn" : "hidden"}><h6>Next Step</h6></div>
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
                        <h3 className="header_step">Begin Software Analysis</h3>
                        <div className="underline"></div>
                        <p>
                                In this step, you will initiate the software analysis on the data collected from the aerial drone's flight. 
                        </p>
                        <p>
                                Ensure the software analysis finishes before attempting to complete the task.
                        </p>
                        <div className="analyzeBtnContainer">
                            <div onClick={this.analyze} className={this.state.data.finishedAnalysis ? "hidden" : "analyzeBtn"}><h6>Initiate Analysis</h6></div>
                        </div>
                        <div className="analyzeCenter">
                            <progress className="analyzeProgress" value={this.state.data.progressVal} max="100">{this.state.data.progressVal}</progress>
                            <h6>{this.state.data.progressMessage}</h6>
                        </div>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Step6;
export type {Step6_Data};