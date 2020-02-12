import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch } from 'react-router';

import 'bootstrap/dist/css/bootstrap.min.css';

import Navigation from './components/Navigation.jsx';
import PS2Manager from './components/PS2Manager';
import POPSManager from './components/POPSManager.jsx';
import Settings from './components/Settings.jsx';

import AppSettingsContext from './contexts/AppSettingsContext.jsx';

import settings from 'electron-settings';

function App() {
    const [appSettings, setAppSettings] = useState(settings.getAll());

    function setSetting(key, value) {
        settings.set(key, value);
        setAppSettings(settings.getAll());
    }

    return (
        <Router>
            <AppSettingsContext.Provider value={{ settings: appSettings, setSetting }} >
                <Navigation />
                <pre>{JSON.stringify(appSettings, null, 2)}</pre>
                <Switch>
                    <Route path="/ps2iso" component={PS2Manager} />

                    <Route path="/psxcdr" component={POPSManager} />

                    <Route path="/settings" component={Settings} />

                    <Route path="/">
                        Welcome to the OPL manager!
                    </Route>
                </Switch>
            </AppSettingsContext.Provider>
        </Router >
    );
}

export default App;
