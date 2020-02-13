import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { remote } from 'electron';

import { readdir } from 'fs';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';

import { exec } from 'child_process';

import AppSettingsContext from '../contexts/AppSettingsContext.jsx';
import { getPSXGameId } from '../utils/cuehelper.js';

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

    function addBinCue() {
        if (oplRoot && cue2popsBin) {
            const popsPath = path.resolve(oplRoot, 'POPS');

            remote.dialog.showOpenDialog({
                properties: ["openFile"],
                filters: [{ extensions: ['cue'], name: 'CUE sheets' }]
            }).then(({ filePaths, canceled }) => {
                if (!canceled) {
                    const cuePath = filePaths[0];

                    getPSXGameId(cuePath).then((gameId) => {
                        console.log('Got game id', gameId);

                        tmp.dir((error, tmpDir, removeCb) => {
                            const cueName = path.parse(cuePath).name;
                            const vcdName = `${gameId}.${cueName}`;
                            const vcdFileName = `${vcdName}.VCD`;
                            const vcdPath = path.resolve(tmpDir, vcdFileName);
                            const vcdPathInPops = path.resolve(popsPath, vcdFileName);
                            const elfPathInPops = path.resolve(popsPath, `${vcdName}.ELF`);
                            const cmd = `${cue2popsBin} "${cuePath}" "${vcdPath}"`;

                            const popstartPath = path.resolve(popsPath, 'POPSTARTER.ELF');

                            console.log('Executing', cmd);

                            exec(cmd, (error, stdout, stderr) => {
                                // cue2pops returns error if things go well??
                                if (error) {
                                    if (error.code === 1) {

                                        console.log('cue2pops done', stdout);
                                        //removeCb();
                                        console.log('Check dir ', tmpDir);

                                        fs.stat(vcdPath, (err, stat) => {
                                            const fileSize = stat.size;
                                            let bytesCopied = 0;

                                            fs.createReadStream(vcdPath)
                                                .on('data', (buffer) => {
                                                    bytesCopied += buffer.length;

                                                    const percentage = ((bytesCopied / fileSize) * 100).toFixed(2);
                                                    console.log('Copied ', percentage);
                                                })
                                                .on('end', () => {
                                                    console.log('finished copying', vcdPathInPops);
                                                    fs.createReadStream(popstartPath)
                                                        .on('end', () => {
                                                            console.log('Game ready to be played');
                                                            removeCb();
                                                        })
                                                        .pipe(fs.createWriteStream(elfPathInPops));
                                                })
                                                .pipe(fs.createWriteStream(vcdPathInPops));
                                        })

                                    } else {
                                        console.error('cue2pops error', stderr);
                                    }
                                }

                            })
                        });
                    });
                }
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