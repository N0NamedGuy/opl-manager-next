import { remote } from 'electron';
import { readdir } from 'fs';
import path from 'path';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap';
import AppSettingsContext from '../contexts/AppSettingsContext.jsx';
import { addPsxBackup, deleteFile } from '../utils';
import ErrorDiplay from './ErrorDiplay.jsx';
import GameList from './GameList.jsx';

const POPSManager = () => {
    const AppSettings = useContext(AppSettingsContext);

    const { oplRoot, cue2popsBin } = AppSettings.settings;

    const [uploadQueue, setUploadQueue] = useState([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, []);

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

        const uploadingGame = {
            fullPath: cuePath,
            progress: {
                percent: 0
            }
        };

        setUploadQueue((queue) => {
            return [...queue, uploadingGame]
        });

        try {
            const game = await addPsxBackup(cuePath, (stats) => {
                uploadingGame.progress = stats;
                setUploadQueue((q) => {
                    return [...q]
                });
            });
            setGameList((gameList) => [...gameList, game]);
        } catch (e) {
            console.error('Error happend', e);
        }
    }

    function deleteBackup(game) {
        const popsDirPath = path.dirname(game.fullPath);
        const elfPath = path.resolve(popsDirPath, `${game.gameId}.${game.title}.ELF`);

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

        {error && <ErrorDiplay error={error} />}

        <Button onClick={() => addNewBackup()}>
            Add new backup
        </Button>

        {uploadQueue.length > 0 && <ListGroup>{
            uploadQueue.map((game, i) => {
                return <ListGroupItem key={i}>
                    <strong>{game.fullPath}</strong>
                    <br/>
                    <ProgressBar now={game.progress.percent}
                        label={`${game.progress.percent} %`}/>
                </ListGroupItem>
            })
        }</ListGroup>}

        <br/>
        <br/>

        <GameList gameList={gameList}
            onDelete={deleteBackup} />
    </Container>);
}

export default POPSManager;