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
        if (oplRoot) {
            readdir(path.resolve(oplRoot, 'POPS'), (err, files) => {
                if (!err) {
                    setFileList(files);
                } else {
                    console.error('No POPS folder!');
                }
            });
        }
    });

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
            Add new BIN/CUE
        </Button>
        {
            fileList.map((file, i) => {
                return (<Card key={i}>
                    <Card.Body>
                        <Card.Title>{file}</Card.Title>
                    </Card.Body>
                </Card>);
            })
        }
    </Container>);
}

export default POPSManager;