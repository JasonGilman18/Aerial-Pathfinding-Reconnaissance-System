import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sidebar.css';
import logoIcon from './icons/logo.png';
import Step from './../step/step';

type SidebarProps = {};
type SidebarStates = {};
class Sidebar extends React.Component<SidebarProps, SidebarStates>
{
    render()
    {
        return(
            <div id="sidebarBox">
                <div id="logoBox">
                    <img src={logoIcon}/>
                </div>
                <div id="stepsBox">
                    <Step position="first"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="middle"/>
                    <Step position="last"/>
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
        );
    }
}

export default Sidebar;