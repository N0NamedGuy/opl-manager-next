import { remote } from 'electron';
import { readdir } from 'fs';
import path from 'path';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, ListGroup, ListGroupItem } from 'react-bootstrap';
import AppSettingsContext from '../contexts/AppSettingsContext.jsx';
import { addPsxBackup, deleteFile } from '../utils';
import ErrorDiplay from './ErrorDiplay.jsx';

const POPSManager = () => {
    const AppSettings = useContext(AppSettingsContext);

    const { oplRoot, cue2popsBin } = AppSettings.settings;

    const [gameList, setGameList] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const popsDirPath = path.resolve(oplRoot, 'POPS');
        if (oplRoot) {
            readdir(popsDirPath, (err, files) => {
                if (!err) {
                    setGameList(files.filter((file) =>
                        file.endsWith('.VCD')
                    ).map((file) => {
                        const match = file.match(/(?<gameId>.{4}_\d{3}.\d{2})\.(?<title>.*)\.VCD/);
                        return {
                            fullPath: path.resolve(popsDirPath, file),
                            fileName: file,
                            ...match.groups
                        };
                    }));
                } else {
                    console.error('No POPS folder!');
                    setError({
                        description: 'No POPS folder',
                        cta: {
                            description: 'Make sure there is a POPS directory on the OPL root directory',
                            label: 'Go to settings',
                            route: '/settings'
                        }
                    })
                }
            });
        }
    }, [oplRoot]);

    async function addNewBackup() {
        if (!(oplRoot && cue2popsBin)) {
            throw new Error('oplRoot or cue2popsBin not set');
        }

        // Ask the user for the CUE file
        const { filePaths, canceled } = await remote.dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ extensions: ['cue'], name: 'CUE sheets' }]
        });

        // User canceled? We quit!
        if (canceled) {
            return;
        }

        const cuePath = filePaths[0];
        try {
            await addPsxBackup(cuePath, (stats) => {
                console.log(stats);
            });
        } catch (e) {
            console.error('Error happend', e);
        }
    }

    function deleteBackup(game) {
        const popsDirPath = path.dirname(game.fullPath);
        const elfPath = path.resolve(popsDirPath,`${game.gameId}.${game.title}.ELF`);

        Promise.all([
            deleteFile(game.fullPath),
            deleteFile(elfPath)
        ])
            .then(() => {
                // Find index of game
                const index = gameList.findIndex((g) => {
                    return g.fullPath === game.fullPath;
                });

                setGameList((gameList) => {
                    gameList.splice(index, 1);
                    return [...gameList];
                });
            });
    }

    return (<Container>
        <Button onClick={() => addNewBackup()}>
            Add new backup
        </Button>
        {error ? <ErrorDiplay error={error} /> :
            <ListGroup>
                {gameList.map((game, i) => {
                    return (<ListGroupItem key={i}>
                        <div className="d-flex">
                            <span className="flex-grow">
                                <small><tt>[{game.gameId}]</tt></small> &nbsp;
                                <strong>{game.title}</strong>
                                <br />
                                <small className="text-muted">{game.fullPath}</small>
                            </span>
                            <span>
                                <Button variant="danger"
                                    onClick={() => {deleteBackup(game)}}>Delete</Button>
                            </span>
                        </div>
                    </ListGroupItem>);
                })}
            </ListGroup>
        }
    </Container>);
}

export default POPSManager;