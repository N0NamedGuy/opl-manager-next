import {createContext } from 'react';

const AppSettingsContext = createContext({
    settings: {},
    setSetting: (key, value) => {}
});

export default AppSettingsContext;