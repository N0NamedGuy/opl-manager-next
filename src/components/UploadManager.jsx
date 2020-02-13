import React, { useState } from 'react';
import { ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap';

import UploadManagerContext from '../contexts/UploadManagerContext.jsx';
import { addPsxBackup } from '../utils';

const UploadManager = ({ children }) => {
    const [psxQueue, setPsxQueue] = useState([]);

    function addPsxGames(filePaths) {
        return new Promise((resolve, reject) => {
            const promises = filePaths.map(async (cuePath) => {
                const uploadingGame = {
                    fullPath: cuePath,
                    progress: {
                        percent: 0
                    }
                };

                setPsxQueue((queue) => {
                    return [...queue, uploadingGame]
                });

                const game = await addPsxBackup(cuePath, (stats) => {
                    uploadingGame.progress = stats;
                    setPsxQueue((q) => {
                        return [...q]
                    });
                });

                return game;
            });

            Promise.all(promises)
                .then(resolve)
                .catch(reject);
        });
    }

    return <UploadManagerContext.Provider value={{psxQueue, addPsxGames}}>

        {psxQueue.length > 0 && <ListGroup>{
            psxQueue.map((game, i) => {
                return <ListGroupItem key={i}>
                    <strong>{game.fullPath}</strong>
                    <br />
                    <ProgressBar now={game.progress.percent}
                        label={`${game.progress.percent} %`} />
                </ListGroupItem>
            })
        }</ListGroup>}

        {children}
    </UploadManagerContext.Provider>
};

export default UploadManager;