import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import Console from './console/console';
import Header from './header/header';
import Footer from './footer/footer';
import Sidebar from './sidebar/sidebar';
import './index.css';

type MainProps = {};
type MainStates = {};
class Main extends React.Component<MainProps, MainStates>
{
    render()
    {
        return(
            <Container fluid id="mainContainer">
                <Header/>
                <Container fluid id="middleRow">
                    <Sidebar/>
                    <Console/>
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