import React from 'react';
import ReactDOM from 'react-dom';
import Step1 from './step1/step1';
import Step2, {Step2_Data} from './step2/step2';
import Step3, {Step3_Data} from './step3/step3';


type ConsoleProps = {display: number, stepStatus: Array<string>, func_onUpdateStepStatus: any, func_onNextButtonClick: any};
type ConsoleStates = {display: number, stepStatus: Array<string>, step2_data: Step2_Data, step3_data: Step3_Data};
class Console extends React.Component<ConsoleProps, ConsoleStates>
{
    constructor(props: any)
    {
        super(props);

        var tempStep2Data: Step2_Data = {coordinates: "", mapMarkers: [], showMap: false, latInput: "", lngInput: "", mapCenter: [], mapRectangles: [], createRectangle: true, locationTable: {}, mappingArea: ""};
        var tempStep3Data: Step3_Data = {progressVal: "0", progressMessage: "", finishedUpload: false};
        this.state = {stepStatus: this.props.stepStatus, display: this.props.display, step2_data: tempStep2Data, step3_data: tempStep3Data};
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
            }
        }
        else
            return "prevError";
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
                return <Step3 stepStatus={this.state.stepStatus[2]} data={this.state.step3_data} func_onUpdateStepStatus={this.props.func_onUpdateStepStatus} func_onNextButtonClick={this.props.func_onNextButtonClick} func_checkForErrors={this.checkForErrors.bind(this)}></Step3>
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