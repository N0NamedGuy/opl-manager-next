import { createContext } from 'react';

const UploadManager = createContext({
    psxQueue: [],
    addPsxGames: (games) => {}
});

export default UploadManager;