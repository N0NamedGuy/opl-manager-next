import { remote } from 'electron';
import { readdir } from 'fs';
import path from 'path';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import tmp from 'tmp-promise';
import AppSettingsContext from '../contexts/AppSettingsContext.jsx';
import { copyFile, cue2pops } from '../utils';
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

    async function addBinCue() {
        if (!(oplRoot && cue2popsBin)) {
            throw new Error('oplRoot or cue2popsBin not set');
        }

        // Holder for temporary files removal
        // even if stuff went wrong
        let tmpRemoveCb;

        try {
            // Figure our remote POPS folder
            const popsPath = path.resolve(oplRoot, 'POPS');

            // Ask the user for the CUE file
            const { filePaths, canceled } = await remote.dialog.showOpenDialog({
                properties: ["openFile"],
                filters: [{ extensions: ['cue'], name: 'CUE sheets' }]
            });

            // User canceled? We quit!
            if (canceled) {
                throw new Error('User canceled');
            }

            const cuePath = filePaths[0];
            const cueName = path.parse(cuePath).name;

            // TODO: make sure cuePath game name is LESS than 32 chars 
            // and prompt the user for another name
            // For now we just quit
            if (cueName.length > 32) {
                throw new Error('Cue filename is too long');
            }

            // Get a game ID, because it need it for renaming reasons
            const gameId = await getPSXGameId(cuePath)

            // Create a tmp dir so we can do convertions
            const {
                path: tmpDir,
                cleanup: tmpRemove
            } = await tmp.dir({
                unsafeCleanup: true
            });
            tmpRemoveCb = tmpRemove;

            const vcdName = `${gameId}.${cueName}`;
            const vcdFileName = `${vcdName}.VCD`;

            // Do some the cue to pops (CUE/BIN to VCD) convertion
            const vcdPath = path.resolve(tmpDir, vcdFileName);
            await cue2pops(cuePath, vcdPath)

            // Copy the VCD file into the OPL root
            const vcdPathInPops = path.resolve(popsPath, vcdFileName);
            await copyFile(vcdPath, vcdPathInPops)
                .progress((stats) => {
                    console.log(`[${stats.percent}] ${stats.copied}/${stats.size}`);
                });

            // And copy POPSTARTER.ELF with the naming format as
            // the VCD file
            const elfPathInPops = path.resolve(popsPath, `${vcdName}.ELF`);
            const popstartPath = path.resolve(popsPath, 'POPSTARTER.ELF');
            await copyFile(popstartPath, elfPathInPops);
            
        } catch (err) {
            console.error('Error uploading backup', err);
        } finally {
            if (tmpRemoveCb) {
                tmpRemoveCb();
            }
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
    </Container>);
}

export default POPSManager;