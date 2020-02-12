import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch } from 'react-router';

import 'bootstrap/dist/css/bootstrap.min.css';

import Navigation from './components/Navigation.jsx';
import POPSManager from './components/POPSManager';

function App() {
    return (
        <Router>
            <div>
                <Navigation />
                <Switch>
                    <Route path="/ps2iso">
                        <h1>Playstation 2 ISO manager</h1>
                    </Route>

                    <Route path="/psxcdr" component={POPSManager} />

                    <Route path="/">
                        Welcome to the OPL manager!
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
