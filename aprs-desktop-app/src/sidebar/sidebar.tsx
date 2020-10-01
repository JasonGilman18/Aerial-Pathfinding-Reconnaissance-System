import React from 'react';
import ReactDOM from 'react-dom';
import {Container} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './sidebar.css';

type SidebarProps = {};
type SidebarStates = {};
class Sidebar extends React.Component<SidebarProps, SidebarStates>
{
    render()
    {
        return(
            <div id="sidebarBox">

            </div>
        );
    }
}

export default Sidebar;