import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './step.css';

type StepProps = {position: string};
type StepStates = {position: string};
class Step extends React.Component<StepProps, StepStates>
{
    constructor(props: any)
    {
        super(props);
        this.state = {position: this.props.position};
    }

    render()
    {
        return(
            <div className={"stepBox " + this.state.position}>
                <div className="stepNameArea">

                </div>
                <div className="stepStatus">
                    <div className="status"/>
                </div>
            </div>
        );
    }
}

export default Step;