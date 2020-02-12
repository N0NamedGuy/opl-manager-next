import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { remote } from 'electron';

import { readdir } from 'fs';
import path from 'path';
import tmp from 'tmp';

import AppSettingsContext from '../contexts/AppSettingsContext.jsx';

const POPSManager = () => {
    const AppSettings = useContext(AppSettingsContext);

    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const oplRoot = AppSettings.settings && AppSettings.settings.oplRoot;

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

    function addBinCue() {
        const oplRoot = AppSettings.settings && AppSettings.settings.oplRoot;

        if (oplRoot) {
            const popsPath = path.resolve(oplRoot, 'POPS');

            remote.dialog.showOpenDialog({
                properties: ["openFile"]
            }).then((file) => {
                tmp.dir((error, tmpDir, removeCb) => {
                    const tempVcd = path.resolve(tmpDir, 'temp.vcd');
                    //
                    removeCb();
                });
            });
        }
    }

    return (<Container>
        <Button onClick={() => addBinCue()}>
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
    </Container>)
};

export default POPSManager;