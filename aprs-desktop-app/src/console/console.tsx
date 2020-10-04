import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './console.css';

type ConsoleProps = {display: number, onUpdateStepStatus: any, stepStatus: Array<string>, onNextButtonClick: any};
type ConsoleStates = {display: number, coordinates: string};
class Console extends React.Component<ConsoleProps, ConsoleStates>
{
    private coordinateInput: React.RefObject<HTMLInputElement>;

    constructor(props: any)
    {
        super(props);
        this.coordinateInput = React.createRef();
        this.state = {display: this.props.display, coordinates: ""};
    }

    componentWillReceiveProps(newProp: any)
    {
        if(this.state.display != newProp.display)
        {
            this.setState({display: newProp.display});
        }
    }

    pullCoordinates()
    {

        //issue with ref
        var inputVal = this.coordinateInput.current.value;
        this.setState({coordinates: inputVal});
    }

    checkForErrors()
    {
        var stepDisplayed = this.state.display;
        
        switch(stepDisplayed)
        {
            case 0:
                return "complete";

            case 1:

            break;
        }
    }

    render()
    {
        return(
            <div id="consoleBox">
                <div className={this.state.display==0 ? "consoleStep step1" : "hidden"}>
                    <h1>Step 1</h1>
                    <button onClick={() => this.props.onUpdateStepStatus(0, this.checkForErrors())}>Complete</button>
                    <button onClick={() => {this.props.onNextButtonClick(0+1);this.props.onUpdateStepStatus(0+1, "inprogress")}} className={this.props.stepStatus[0]=="complete" ? "nextButton" : "hidden"}>Next Step</button>
                </div>
                <div className={this.state.display==1 ? "consoleStep step2" : "hidden"}>
                    <h1>Step 2</h1>
                    <button onClick={() => this.props.onUpdateStepStatus(1, "complete")}>Complete</button>
                    <input ref={this.coordinateInput} type="text" placeholder="coordinates"></input>
                    <button onClick={() => this.pullCoordinates()}>submit coordinates</button>
                </div>
                <div className={this.state.display==2 ? "consoleStep step3" : "hidden"}>
                    step3
                </div>
                <div className={this.state.display==3 ? "consoleStep step4" : "hidden"}>
                    step4
                </div>
                <div className={this.state.display==4 ? "consoleStep step5" : "hidden"}>
                    step5
                </div>
                <div className={this.state.display==5 ? "consoleStep step6" : "hidden"}>
                    step6
                </div>
                <div className={this.state.display==6 ? "consoleStep step7" : "hidden"}>
                    step7
                </div>
                <div className={this.state.display==7 ? "consoleStep step8" : "hidden"}>
                    step8
                </div>
            </div>
        );
    }
}

export default Console;