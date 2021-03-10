import React from 'react';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './../console.css';
import './step6.css';


interface Step6_Data {downscale: number, min_disp: number, sigma: number, progressVal: string, progressMessage: string, showGeneratePath: boolean, depthMap: any, pathMap: any, navInstructions: any,finishedAnalysis: boolean};

type Step6Props = {stepStatus: string, data: Step6_Data, func_onUpdateStepStatus: any, func_onNextButtonClick: any, func_checkForErrors: any, func_connectToDrone: any};
type Step6State = {stepStatus: string, data: Step6_Data, errorMsg: Array<string>};
class Step6 extends React.Component<Step6Props, Step6State>
{
    constructor(props: any)
    {
        super(props);

        this.state = {stepStatus: this.props.stepStatus, data: this.props.data, errorMsg: ["Initiate the software analysis of the data collected by the aerial drone."]};

        this.analyze = this.analyze.bind(this);
        this.adjustInputs = this.adjustInputs.bind(this);
        this.generatePath = this.generatePath.bind(this);
        this.getInputParams = this.getInputParams.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        this.setState({stepStatus: newProp.stepStatus, data: newProp.data});
    }

    analyzeInputs(e: React.ChangeEvent<HTMLInputElement>, whichParam: number)
    {
        if(whichParam == 1)
        {
            var tempData = this.state.data;
            tempData.downscale = parseInt(e.currentTarget.value);
            this.setState({data: tempData});
        }
        else if(whichParam == 2)
        {
            var tempData = this.state.data;
            tempData.min_disp = parseInt(e.currentTarget.value);
            this.setState({data: tempData});
        }
        else if(whichParam == 3)
        {
            var tempData = this.state.data;
            tempData.sigma = parseFloat(e.currentTarget.value);
            this.setState({data: tempData});
        }
    }

    async analyze()
    {
        if(this.props.func_checkForErrors(this.state.data) != "prevError")
        {
            var tempData = this.state.data;
            tempData.progressVal = "0";
            tempData.progressMessage = "Loading files and removing obstacles...";
            this.setState({data: tempData});

            const response = await fetch('http://localhost:5000/cvopen', {method: 'GET'});
            if(response.status == 200)
            {
                var tempData2 = this.state.data;
                tempData2.progressVal = "33";
                tempData2.progressMessage = "Creating disparity maps...";
                this.setState({data: tempData2});

                const inputParams = this.getInputParams();
                const response2 = await fetch('http://localhost:5000/cvdepth' + inputParams, {method: 'GET'});
                if(response2.status == 200)
                {
                    var tempData3 = this.state.data;
                    tempData3.progressVal = "66";
                    tempData3.progressMessage = "Waiting for generate path confirmation or adjustment of inputs...";
                    tempData3.showGeneratePath = true;

                    var imgBlob = await response2.blob();
                    var imgUrl = URL.createObjectURL(imgBlob);
                    tempData3.depthMap = imgUrl;

                    this.setState({data: tempData3});
                }
                else
                {
                    this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
                    this.setState({errorMsg: ["Unable to finish software analysis", "Error occured while creating disparity maps"]});
                }
            }
            else
            {
                this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
                this.setState({errorMsg: ["Unable to finish software analysis", "Error occured while loading files and removing obstacles"]});
            }
        }
        else
        {
            this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
        }
    }

    async adjustInputs()
    {
        var tempData2 = this.state.data;
        tempData2.progressVal = "33";
        tempData2.progressMessage = "Creating disparity maps...";
        this.setState({data: tempData2});

        const inputParams = this.getInputParams();
        const response2 = await fetch('http://localhost:5000/cvdepth' + inputParams, {method: 'GET'});
        if(response2.status == 200)
        {
            var tempData3 = this.state.data;
            tempData3.progressVal = "66";
            tempData3.progressMessage = "Waiting for generate path confirmation or adjustment of inputs...";
            tempData3.showGeneratePath = true;

            var imgBlob = await response2.blob();
            var imgUrl = URL.createObjectURL(imgBlob);
            tempData3.depthMap = imgUrl;

            this.setState({data: tempData3});
        }
        else
        {
            this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
            this.setState({errorMsg: ["Unable to finish software analysis", "Error occured while creating disparity maps"]});
        }
    }

    async generatePath()
    {
        var tempData = this.state.data;
        tempData.progressMessage = "Generating path...";
        this.setState({data: tempData});

        const response = await fetch('http://localhost:5000/cvpath', {method: 'GET'});
        if(response.status == 200)
        {
            var tempData2 = this.state.data;
            tempData2.progressVal = "100";
            tempData2.progressMessage = "Path generated.";
            tempData2.finishedAnalysis = true;
            
            var responseObject = await response.json();
            tempData2.pathMap = responseObject.img;
            tempData2.navInstructions = responseObject.nav;
            
            this.setState({data: tempData2});
        }
        else
        {
            this.props.func_onUpdateStepStatus(5, this.props.func_checkForErrors(this.state.data));
            this.setState({errorMsg: ["Unable to finish software analysis", "Error occured while generating path"]});
        }
    }

    getInputParams()
    {
        var downscale = this.state.data.downscale;
        var min_disp = this.state.data.min_disp;
        var sigma = this.state.data.sigma;

        (downscale < 1) ? downscale = 1 : downscale = downscale;
        (downscale > 4) ? downscale = 4 : downscale = downscale;
        (min_disp < 1) ? min_disp = 1 : min_disp = min_disp;
        (min_disp > 40) ? min_disp = 40 : min_disp = min_disp;
        (sigma < 0) ? sigma = 0.0 : sigma = sigma;
        (sigma > 6) ? sigma = 6.0 : sigma = sigma;

        var sigmaString = sigma.toString();
        if(Number.isInteger(sigma))
        {
            sigmaString = sigma.toString() + ".0";
        }

        var urlParams = '/' + downscale + '/' + min_disp + '/' + sigmaString;
        return urlParams;
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
                        <div className={this.state.data.finishedAnalysis ? "hidden" : "analyzeInputContainer"}>
                            <div className="analyzeInput firstAnalyzeInput">
                                <label className="analyzeParamLabel" htmlFor="downscale">Downscale Factor</label>
                                <div className="actualInputs">
                                    <input min="1" max="4" step="1" value={this.state.data.downscale} onChange={(e) => this.analyzeInputs(e, 1)} type="range" name="downscale" className="analyzeParamSlider"></input>
                                    <input min="1" max="4" step="1" value={this.state.data.downscale} onChange={(e) => this.analyzeInputs(e, 1)} type="number" className="analyzeParamNumber"></input>
                                </div>
                            </div>
                            <div className="analyzeInput">
                                <label className="analyzeParamLabel" htmlFor="min_disp">Minimum Disparity</label>
                                <div className="actualInputs">
                                    <input min="1" max="40" step="1" value={this.state.data.min_disp} onChange={(e) => this.analyzeInputs(e, 2)} type="range" name="min_disp" className="analyzeParamSlider"></input>
                                    <input min="1" max="40" step="1" value={this.state.data.min_disp} onChange={(e) => this.analyzeInputs(e, 2)} type="number" className="analyzeParamNumber"></input>
                                </div>
                            </div>
                            <div className="analyzeInput">
                                <label className="analyzeParamLabel" htmlFor="sigma">Sigma Value</label>
                                <div className="actualInputs">
                                    <input min="0.0" max="6.0" step=".1" value={this.state.data.sigma} onChange={(e) => this.analyzeInputs(e, 3)} type="range" name="sigma" className="analyzeParamSlider"></input>
                                    <input min="0.0" max="6.0" step=".1" value={this.state.data.sigma} onChange={(e) => this.analyzeInputs(e, 3)} type="number" className="analyzeParamNumber"></input>
                                </div>
                            </div>
                        </div>
                        <div className={this.state.data.finishedAnalysis ? "hidden" : (this.state.data.showGeneratePath ? "analyzeImgArea" : "hidden")}>
                            <img src={this.state.data.depthMap} className="depthImg"></img>
                        </div>
                        <div className={this.state.data.finishedAnalysis ? "analyzeImgArea" : "hidden"}>
                            <img src={'data:image/png;base64,'+ this.state.data.pathMap} className="depthImg"></img>
                        </div>
                        <div className="analyzeBtnContainer">
                            <div onClick={this.analyze} className={this.state.data.finishedAnalysis ? "hidden" : (this.state.data.showGeneratePath ? "hidden" : "analyzeBtn")}><h6>Initiate Analysis</h6></div>
                            <div onClick={this.adjustInputs} className={this.state.data.finishedAnalysis ? "hidden" : (this.state.data.showGeneratePath ? "analyzeBtn" : "hidden")}><h6>Rerun Analysis</h6></div>
                            <div onClick={this.generatePath} className={this.state.data.finishedAnalysis ? "hidden" : (this.state.data.showGeneratePath ? "analyzeBtn" : "hidden")}><h6>Generate Path</h6></div>
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