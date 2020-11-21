import React from 'react';
import Step1 from './step1/step1';
import Step2, {Step2_Data} from './step2/step2';
import Step3, {Step3_Data} from './step3/step3';
import Step4, {Step4_Data} from './step4/step4';
import Step5, {Step5_Data} from './step5/step5';
import Step6, {Step6_Data} from './step6/step6';
import Step7, {Step7_Data} from './step7/step7';
import Step8, {Step8_Data} from './step8/step8';
const {ipcRenderer} = window.require('electron');


interface Time {hours: number, minutes: number, seconds: number}

type ConsoleProps = {display: number, stepStatus: Array<string>, func_onUpdateStepStatus: any, func_onNextButtonClick: any};
type ConsoleStates = {display: number, stepStatus: Array<string>, step2_data: Step2_Data, step3_data: Step3_Data, step4_data: Step4_Data, step5_data: Step5_Data, step6_data: Step6_Data, step7_data: Step7_Data, step8_data: Step8_Data};
class Console extends React.Component<ConsoleProps, ConsoleStates>
{
    private timeInterval_step4: any;
    private timeInterval_step8: any;

    constructor(props: any)
    {
        super(props);

        this.timeInterval_step4 = 0;
        this.timeInterval_step8 = 0;
        var tempStep2Data: Step2_Data = {coordinates: "", mapMarkers: [], showMap: false, latInput: "", lngInput: "", mapCenter: [], mapRectangles: [], createRectangle: true, locationTable: {}, mappingArea: ""};
        var tempStep3Data: Step3_Data = {progressVal: "0", progressMessage: "", finishedUpload: false};
        var tempStep4Data: Step4_Data = {flightStarted: false, flightEnded: false, time: {hours: 0, minutes: 0, seconds: 0}, finalTime: {hours: 0, minutes: 0, seconds: 0}, seconds: 0, progressVal: "0", progressMessage: ""};
        var tempStep5Data: Step5_Data = {dataDownloaded: false, progressVal: "", progressMessage: ""};
        var tempStep6Data: Step6_Data = {progressVal: "", progressMessage: "", finishedAnalysis: false};
        var tempStep7Data: Step7_Data = {progressVal: "", progressMessage: "", finishedUpload: false};
        var tempStep8Data: Step8_Data = {droneStarted: false, timerEnded: false, time: {hours: 0, minutes: 0, seconds: 0}, finalTime: {hours: 0, minutes: 0, seconds: 0}, seconds: 0, progressVal: "0", progressMessage: ""};
        this.state = {stepStatus: this.props.stepStatus, display: this.props.display, step2_data: tempStep2Data, step3_data: tempStep3Data, step4_data: tempStep4Data, step5_data: tempStep5Data, step6_data: tempStep6Data, step7_data: tempStep7Data, step8_data: tempStep8Data};
        
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
                case 5:
                    if(data.finishedAnalysis)
                        return "complete";
                    else
                        return "error";
                case 6:
                    if(data.finishedUpload)
                        return "complete";
                    else
                        return "error";
                case 7:
                    if(data.timerEnded)
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

    startTimer(step4: boolean = true)
    {
        if(step4)
        {
            this.timeInterval_step4 = setInterval(() => this.timer(true), 1000);
        }
        else
        {
            this.timeInterval_step8 = setInterval(() => this.timer(false), 1000);
        }
        
    }

    timer(step4: boolean = true)
    {
        if(step4)
        {
            var tempStep4Data = this.state.step4_data;
            tempStep4Data.seconds += 1;
            tempStep4Data.time = this.createDisplayTime(tempStep4Data.seconds);
            this.setState({step4_data: tempStep4Data});
        }
        else
        {
            var tempStep8Data = this.state.step8_data;
            tempStep8Data.seconds += 1;
            tempStep8Data.time = this.createDisplayTime(tempStep8Data.seconds);
            this.setState({step8_data: tempStep8Data});
        }
        
    }

    stopTimer(step4: boolean = true)
    {
        if(step4)
        {
            clearInterval(this.timeInterval_step4);
            var tempStep4Data = this.state.step4_data;
            tempStep4Data.finalTime = {hours: tempStep4Data.time.hours, minutes: tempStep4Data.time.minutes, seconds: tempStep4Data.time.seconds};
            this.setState({step4_data: tempStep4Data});
        }
        else
        {
            clearInterval(this.timeInterval_step8);
            var tempStep8Data = this.state.step8_data;
            tempStep8Data.finalTime = {hours: tempStep8Data.time.hours, minutes: tempStep8Data.time.minutes, seconds: tempStep8Data.time.seconds};
            this.setState({step8_data: tempStep8Data});
        }
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
            case 5:
                return <Step6 stepStatus={this.state.stepStatus[5]} data={this.state.step6_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)} func_connectToDrone={this.connectToDrone.bind(this)}></Step6>;
            case 6:
                return <Step7 stepStatus={this.state.stepStatus[6]} data={this.state.step7_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)} func_connectToDrone={this.connectToDrone.bind(this)}></Step7>;
            case 7:
                return <Step8 stepStatus={this.state.stepStatus[7]} data={this.state.step8_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)} func_connectToDrone={this.connectToDrone.bind(this)} func_startTimer={this.startTimer.bind(this)} func_stopTimer={this.stopTimer.bind(this)}></Step8>
        }
    }
}

export default Console;
export type {Time};