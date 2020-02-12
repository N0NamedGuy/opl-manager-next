import { extract7z } from 'es-7z';
import { readdir, readFile } from 'fs';
import path from 'path';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import tmp from 'tmp';
import AppSettingsContext from '../contexts/AppSettingsContext.jsx';

const PS2Manager = () => {
    const AppSettings = useContext(AppSettingsContext);

    const [fileList, setFileList] = useState([]);
    const [isoFileData, setIsoFileData] = useState(null);

    const oplRoot = AppSettings.settings && AppSettings.settings.oplRoot;

    useEffect(() => {
        if (oplRoot) {
            readdir(path.resolve(oplRoot, 'DVD'), (err, files) => {
                if (!err) {
                    setFileList(files);
                } else {
                    console.error('No DVD folder!');
                }
            });
        }
    }, [oplRoot]);

    function checkContents(file) {
        const fullName = path.resolve(oplRoot, 'DVD', file);

        /*
                const exePath = path.resolve(
                    path.dirname(require.resolve('7zip-bin')),
                    SevenZBin.path7za.substring(1));
        */
        const exePath = '/usr/bin/7z';

        tmp.dir((err, tmpPath, cleanupCb) => {
            extract7z(fullName, tmpPath, {
                wildcards: ['SYSTEM.CNF'],
                exePath
            })
                .then(() => {
                    const systemCnfPath = path.resolve(tmpPath, 'SYSTEM.CNF');

                    readFile(systemCnfPath, 'ascii', (err, data) => {
                        const keyValues = data.split('\n')
                            .reduce((obj, line) => {
                                const split = line.split('=');

                                if (split.length === 2) {
                                    const key = split[0].trim();
                                    const value = split[1].trim();
                                    obj[key] = value;
                                }

                                return obj;
                            }, {});

                        const gameId = keyValues['BOOT2']
                            .match(/cdrom0:\\(?<gameId>.*);1/)
                            .groups.gameId;

                        setIsoFileData({
                            version: keyValues.VER,
                            region: keyValues.VMODE,
                            gameId
                        });
                        cleanupCb();

                    });
                });
        })

    }

    return (<Container>
        {isoFileData && <pre>{JSON.stringify(isoFileData, null, 2)}</pre>}
        {
            fileList.map((file, i) => {
                return (<Card key={i}>
                    <Card.Body>
                        <Card.Title>{file}</Card.Title>
                        <Button onClick={() => checkContents(file)}>Check contents</Button>
                    </Card.Body>
                </Card>);
            })
        }
    </Container>)
};

export default PS2Manager;