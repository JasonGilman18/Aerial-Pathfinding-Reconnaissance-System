import React, { MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './header.css';
import minIcon from './icons/min-w-10.png';
import maxIcon from './icons/max-w-10.png';
import restoreIcon from './icons/restore-w-10.png';
import closeIcon from './icons/close-w-10.png';

const {ipcRenderer} = window.require('electron');

type HeaderProps = {};
type HeaderStates = {maximized: boolean};
class Header extends React.Component<HeaderProps, HeaderStates>
{
    constructor(props: any)
    {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.state = {maximized: false};
    }

    componentDidMount()
    {
        window.addEventListener("resize", this.handleResize);

        ipcRenderer.on('toolbar', (event: any, arg: boolean) => {
            
            this.setState({maximized: arg});
        });
    }

    handleResize(e: any)
    {
        e.preventDefault();
        ipcRenderer.send('size-change', true);
    }

    handleClick(e: any)
    {
        e.preventDefault();
        var btnID = e.target.id;
        ipcRenderer.send("toolbar", btnID);
    }

    render()
    {
        return(
            <div id="titlebar">
                <div id="drag-region">
                    <div id="window-title">
                        <span>Aerial Pathfinding Reconnaissance System</span>
                    </div>
                    <div id="window-controls">

                        <div className="button" id="min-button" onClick={this.handleClick}>
                            <img className="icon" id="min-icon" src={minIcon} draggable="false" onClick={this.handleClick}/>
                        </div>

                        <div className="button" id="max-button" onClick={this.handleClick} style={this.state.maximized ? {display: 'none'} : {display: 'flex'}}>
                            <img className="icon" id="max-icon" src={maxIcon} draggable="false" onClick={this.handleClick}/>
                        </div>

                        <div className="button" id="restore-button" onClick={this.handleClick} style={this.state.maximized ? {display: 'flex'} : {display: 'none'}}>
                            <img className="icon" id="restore-icon" src={restoreIcon} draggable="false" onClick={this.handleClick}/>
                        </div>

                        <div className="button" id="close-button" onClick={this.handleClick}>
                            <img className="icon" id="close-icon" src={closeIcon} draggable="false" onClick={this.handleClick}/>
                        </div>

                    </div> 
                </div>
            </div>
        );
    }
}

export default Header;