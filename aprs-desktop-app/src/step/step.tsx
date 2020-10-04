import React, { SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './step.css';

type StepProps = {position: string, number: number, description: string, status: string, onStepClick: any};
type StepStates = {position: string, status: string};
class Step extends React.Component<StepProps, StepStates>
{
    constructor(props: any)
    {
        super(props);
        this.state = {position: this.props.position, status: this.props.status};
    }

    componentWillReceiveProps(newProp: any)
    {
        if(newProp.status != this.props.status)
        {
            this.setState({status: newProp.status});
        }
    }

    render()
    {
        return(
            <div onClick={() => {this.props.onStepClick(this.props.number - 1)}} className={"stepBox " + this.state.position}>
                <div className="stepNameArea">
                    <h5>{"Step " + this.props.number}</h5>
                    <h6>{this.props.description}</h6>
                </div>
                <div className="stepStatus">
                    <div className={"status " + this.state.status}/>
                </div>
            </div>
        );
    }
}

export default Step;