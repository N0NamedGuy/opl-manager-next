import 'bootstrap/dist/css/bootstrap.min.css';
import settings from 'electron-settings';
import React, { useState } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import UploadManager from './components/UploadManager.jsx';
import POPSManager from './components/POPSManager.jsx';
import PS2Manager from './components/PS2Manager';
import Settings from './components/Settings.jsx';

import AppSettingsContext from './contexts/AppSettingsContext.jsx';

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
                <UploadManager>
                    <Switch>
                        <Route path="/ps2iso" component={PS2Manager} />

                        <Route path="/psxcdr" component={POPSManager} />

                        <Route path="/settings" component={Settings} />

                        <Route path="/">
                            Welcome to the OPL manager!
                    </Route>
                    </Switch>
                </UploadManager>
            </AppSettingsContext.Provider>
        </Router >
    );
}

export default App;
