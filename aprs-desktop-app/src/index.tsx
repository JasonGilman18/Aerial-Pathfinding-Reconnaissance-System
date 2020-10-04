import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import Console from './console/console';
import Header from './header/header';
import Footer from './footer/footer';
import './index.css';
import logoIcon from './icons/logo.png';
import Step from './step/step';

type MainProps = {};
type MainStates = {selectedStep: number, stepStatus: Array<string>};
class Main extends React.Component<MainProps, MainStates>
{
    constructor(props: any)
    {
        super(props);
        this.state = {selectedStep: 0, stepStatus: ["inprogress", "incomplete", "incomplete", "incomplete", "incomplete", "incomplete", "incomplete", "incomplete"]};
        this.updateSelectedStep = this.updateSelectedStep.bind(this);
    }
    
    updateSelectedStep(i: number)
    {
        this.setState({selectedStep: i});
    }

    updateStepStatus(i: number, status: string)
    {
        var tempStepStatus = this.state.stepStatus;
        tempStepStatus[i] = status;
        console.log(i + " updated to " + status);
        this.setState({stepStatus: tempStepStatus});
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
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[0]} position="first" number={1} description="Instructions"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[1]} position="middle" number={2} description="Select Mapping Area"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[2]} position="middle" number={3} description="Upload Navigation Instructions to Aerial Drone"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[3]} position="middle" number={4} description="Begin Data Collection Flight"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[4]} position="middle" number={5} description="Download Flight Data From Aerial Drone"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[5]} position="middle" number={6} description="Begin Software Analysis"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[6]} position="middle" number={7} description="Upload Navigation Instructions to Land Drone"/>
                            <Step onStepClick={this.updateSelectedStep.bind(this)} status={this.state.stepStatus[7]} position="last" number={8} description="Begin Land Drone Excursion"/>
                        </div>
                        <div id="progressBox">
                            <p>---- starting step 1 -----</p>
                            <p>5%</p>
                            <p>6%</p>
                            <p>7%</p>
                            <p>8%</p>
                            <p>9%</p>
                            <p>10%</p>
                        </div>
                    </div>                    
                    <Console onNextButtonClick={this.updateSelectedStep.bind(this)} stepStatus={this.state.stepStatus} onUpdateStepStatus={this.updateStepStatus.bind(this)} display={this.state.selectedStep}/>
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