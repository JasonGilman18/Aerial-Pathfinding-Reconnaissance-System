import React from 'react';
import Step1 from './step1/step1';
import Step2, {Step2_Data} from './step2/step2';
import Step3, {Step3_Data} from './step3/step3';
import Step4, {Step4_Data, Time} from './step4/step4';
import Step5, {Step5_Data} from './step5/step5';
const {ipcRenderer} = window.require('electron');


type ConsoleProps = {display: number, stepStatus: Array<string>, func_onUpdateStepStatus: any, func_onNextButtonClick: any};
type ConsoleStates = {display: number, stepStatus: Array<string>, step2_data: Step2_Data, step3_data: Step3_Data, step4_data: Step4_Data, step5_data: Step5_Data};
class Console extends React.Component<ConsoleProps, ConsoleStates>
{
    private timeInterval: any;

    constructor(props: any)
    {
        super(props);

        this.timeInterval = 0;
        var tempStep2Data: Step2_Data = {coordinates: "", mapMarkers: [], showMap: false, latInput: "", lngInput: "", mapCenter: [], mapRectangles: [], createRectangle: true, locationTable: {}, mappingArea: ""};
        var tempStep3Data: Step3_Data = {progressVal: "0", progressMessage: "", finishedUpload: false};
        var tempStep4Data: Step4_Data = {flightStarted: false, flightEnded: false, time: {hours: 0, minutes: 0, seconds: 0}, finalTime: {hours: 0, minutes: 0, seconds: 0}, seconds: 0, progressVal: "0", progressMessage: ""};
        var tempStep5Data: Step5_Data = {dataDownloaded: false, progressVal: "", progressMessage: ""};
        this.state = {stepStatus: this.props.stepStatus, display: this.props.display, step2_data: tempStep2Data, step3_data: tempStep3Data, step4_data: tempStep4Data, step5_data: tempStep5Data};
        
        this.startTimer = this.startTimer.bind(this);
        this.timer = this.timer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
    }

    componentWillReceiveProps(newProp: any)
    {
        if(this.state.display != newProp.display)
        {
            this.setState({stepStatus: newProp.stepStatus, display: newProp.display});
        }
        this.setState({stepStatus: newProp.stepStatus});
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

    checkForErrors(data?: any)
    {
        var stepDisplayed = this.state.display;
        
        if(this.checkPreviousStepCompletion(stepDisplayed))
        {
            switch(stepDisplayed)
            {
                case 0:
                    return "complete";

                case 1:
                    if(data.mappingArea == "")
                        return "error";
                    else
                        return "complete";
                case 2:
                    if(data.finishedUpload)
                        return "complete";
                    else
                        return "error";
                case 3:
                    if(data.flightEnded)
                        return "complete";
                    else
                        return "error";
                case 4:
                    if(data.dataDownloaded)
                        return "complete";
                    else
                        return "error";
            }
        }
        else
            return "prevError";
    }

    async connectToDrone()
    {
        ipcRenderer.send('connect-aerial', process.env.REACT_APP_AERIAL_SSID, process.env.REACT_APP_AERIAL_PASS);

        return new Promise(resolve => {
            
            ipcRenderer.on('connect-aerial', (event: any, arg: boolean) => {
            
                resolve(arg);
            });
        });
    }

    startTimer()
    {
        this.timeInterval = setInterval(this.timer, 1000);
    }

    timer()
    {
        var tempStep4Data = this.state.step4_data;
        tempStep4Data.seconds += 1;
        tempStep4Data.time = this.createDisplayTime(tempStep4Data.seconds);
        this.setState({step4_data: tempStep4Data});
    }

    stopTimer()
    {
        clearInterval(this.timeInterval);
        var tempStep4Data = this.state.step4_data;
        tempStep4Data.finalTime = {hours: tempStep4Data.time.hours, minutes: tempStep4Data.time.minutes, seconds: tempStep4Data.time.seconds};
        this.setState({step4_data: tempStep4Data});
    }

    createDisplayTime(s: number)
    {
        var hours = Math.floor(s / (60 * 60));

        var divisor_for_minutes = s % (60* 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);

        var time_obj: Time = {hours: hours, minutes: minutes, seconds: seconds};
        return time_obj;
    }

    render()
    {
        switch(this.state.display)
        {
            case 0:
                return <Step1 stepStatus={this.state.stepStatus[0]} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)}></Step1>;
            case 1:
                return <Step2 stepStatus={this.state.stepStatus[1]} data={this.state.step2_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)}></Step2>;
            case 2:
                return <Step3 stepStatus={this.state.stepStatus[2]} data={this.state.step3_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)} func_connectToDrone={this.connectToDrone.bind(this)} mappingArea={this.state.step2_data.mappingArea}></Step3>;
            case 3:
                return <Step4 stepStatus={this.state.stepStatus[3]} data={this.state.step4_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)} func_connectToDrone={this.connectToDrone.bind(this)} func_startTimer={this.startTimer.bind(this)} func_stopTimer={this.stopTimer.bind(this)}></Step4>;
            case 4:
                return <Step5 stepStatus={this.state.stepStatus[4]} data={this.state.step5_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)} func_connectToDrone={this.connectToDrone.bind(this)}></Step5>;   
            default:
                return(
                    <div id="consoleBox">
                        <div className="consoleStep step3">
                            incomplete
                        </div>
                    </div>
                );
        }
    }
}

export default Console;