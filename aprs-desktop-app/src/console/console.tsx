import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './console.css';

type ConsoleProps = {};
type ConsoleStates = {};
class Console extends React.Component<ConsoleProps, ConsoleStates>
{
    render()
    {
        return(
            <div id="consoleBox">
                <h1>hello</h1>
                <h4>test</h4>
                <p>
                    Here we go

                    test
                </p>
            </div>
        );
    }
}

export default Console;