import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Header = () => {
    return (<Navbar bg="dark" variant="dark">
        <LinkContainer to="/">
            <Navbar.Brand>OPL Manager</Navbar.Brand>
        </LinkContainer>
        <Nav className="mr-auto">
            <LinkContainer to="/ps2iso">
                <Nav.Link>PS2</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/psxcdr">
                <Nav.Link>PSX</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/settings">
                <Nav.Link>Settings</Nav.Link>
            </LinkContainer>
        </Nav>
    </Navbar>);
};

export default Header;