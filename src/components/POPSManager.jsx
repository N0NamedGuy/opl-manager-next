import { remote } from 'electron';
import { readdir } from 'fs';
import path from 'path';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import AppSettingsContext from '../contexts/AppSettingsContext.jsx';
import { addPsxBackup } from '../utils';

const POPSManager = () => {
    const AppSettings = useContext(AppSettingsContext);

    const { oplRoot, cue2popsBin } = AppSettings.settings;

    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const popsDirPath = path.resolve(oplRoot, 'POPS');
        if (oplRoot) {
            readdir(popsDirPath, (err, files) => {
                if (!err) {
                    setFileList(files.filter((file) =>
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

    return (<Container>
        <Button onClick={() => addNewBackup()}>
            Add new backup
        </Button>
        {
            fileList.map((file, i) => {
                return (<Card key={i}>
                    <Card.Body>
                        <strong>{file.title}</strong>
                        <small className="float-right">{file.gameId}</small>
                        <br/>
                        <small className="text-muted">{file.fullPath}</small>
                    </Card.Body>
                </Card>);
            })
        }
    </Container>);
}

export default POPSManager;