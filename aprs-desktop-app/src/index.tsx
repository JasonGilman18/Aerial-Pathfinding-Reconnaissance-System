import React from 'react';
import ReactDOM from 'react-dom';
import {animateScroll} from 'react-scroll';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Console from './console/console';
import Header from './header/header';
import Footer from './footer/footer';
import './index.css';
import logoIcon from './icons/logo.png';
import Step from './step/step';

type MainProps = {};
type MainStates = {selectedStep: number, stepStatus: Array<string>, progressMessages: Array<string>};
class Main extends React.Component<MainProps, MainStates>
{
    constructor(props: any)
    {
        super(props);
        this.state = {
                        selectedStep: 0, 
                        stepStatus: ["inprogress", "incomplete", "incomplete", "incomplete", "incomplete", "incomplete", "incomplete", "incomplete"],
                        //stepStatus: ["complete", "complete", "complete", "complete", "incomplete", "incomplete", "incomplete", "incomplete"],
                        progressMessages: ["----Welcome----"]
                    };

        this.updateSelectedStep = this.updateSelectedStep.bind(this);
        this.updateStepStatus = this.updateStepStatus.bind(this);
    }
    
    updateSelectedStep(i: number)
    {
        this.setState({selectedStep: i});
    }

    updateStepStatus(i: number, status: string, bypass: boolean = false)
    {
        var tempStepStatus = this.state.stepStatus;
        var currentStatus = tempStepStatus[i];
        
        if(bypass || (currentStatus != "complete" && currentStatus != "error"))
        {
            var similar = tempStepStatus[i] == status;
            tempStepStatus[i] = status;
            this.setState({stepStatus: tempStepStatus});

            var message = "";
            if(status == "error" || status == "prevError")
            {
                message = "Step " + (i+1) + " has errors!";
            }
            else if(status == "inprogress")
            {
                if(similar)
                    message = "Step " + (i+1) + " resumed...";
                else
                    message = "Step " + (i+1) + " started...";
            }
            else if(status == "complete")
            {
                message = "Step " + (i+1) + " completed without errors!";
            }
            this.pushMessageToProgress(message);
        }
    }

    pushMessageToProgress(message: string)
    {
        var tempMessageArray = this.state.progressMessages;
        tempMessageArray.push(message);
        this.setState({progressMessages: tempMessageArray});
        animateScroll.scrollToBottom({containerId: "progressBox", delay: 0, smooth: true});
        animateScroll.scrollMore(100, {containerId: "progressBox", delay: 0, smooth: true});
    }

    render()
    {
        return(
            <Container fluid id="mainContainer">
                <Header/>
                <Container fluid id="middleRow">
                    <div id="sidebarBox">
                        <div id="logoBox">
                            <img src={logoIcon}/>
                        </div>
                        <div id="stepsBox">
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[0]} position="first" number={1} description="Instructions"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[1]} position="middle" number={2} description="Select Mapping Area"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[2]} position="middle" number={3} description="Upload Navigation Instructions to Aerial Drone"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[3]} position="middle" number={4} description="Begin Data Collection Flight"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[4]} position="middle" number={5} description="Download Flight Data From Aerial Drone"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[5]} position="middle" number={6} description="Begin Software Analysis"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[6]} position="middle" number={7} description="Upload Navigation Instructions to Land Drone"/>
                            <Step func_onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[7]} position="last" number={8} description="Begin Land Drone Excursion"/>
                        </div>
                        <div id="progressBox">
                            {
                                this.state.progressMessages.map(message => (
                                    <p>{message}</p>
                                ))
                            }
                        </div>
                    </div>                    
                    <Console func_onNextButtonClick={this.updateSelectedStep.bind(this)} stepStatus={this.state.stepStatus} func_onUpdateStepStatus={this.updateStepStatus.bind(this)} display={this.state.selectedStep}/>
                </Container>
                <Footer/>
            </Container>
        );
    }
}

ReactDOM.render(
    <Main/>,
    document.getElementById('root')
);