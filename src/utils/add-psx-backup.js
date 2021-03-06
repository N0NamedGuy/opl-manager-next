import path from 'path';
import tmp from 'tmp-promise';
import settings from 'electron-settings';


import getPSXGameId from './get-psx-game-id.js';
import cue2pops from './cue2pops.js';
import copyFile from './copy-file.js';

async function addPsxBackup(cuePath, progressCb) {
    // Holder for temporary files removal fn
    // even if stuff went wrong
    let tmpRemoveCb;

    const oplRoot = settings.get('oplRoot');
    if (!oplRoot) {
        throw new Error('no-opl-root')
    }

    try {
        const gameTitle = path.parse(cuePath).name;

        if (gameTitle.length > 32) {
            throw new Error('long-name');
        }

        // Create a tmp dir so we can do convertions
        const {
            path: tmpDir,
            cleanup: tmpRemove
        } = await tmp.dir({
            unsafeCleanup: true
        });
        tmpRemoveCb = tmpRemove;

        // Get a game ID, because it need it for renaming reasons
        const gameId = await getPSXGameId(cuePath)

        const nameWithGameId = `${gameId}.${gameTitle}`;
        const popsPath = path.resolve(oplRoot, 'POPS');

        // Copy POPSTARTER.ELF with the naming format as
        // the VCD file
        const fullElfPath = path.resolve(popsPath, `${nameWithGameId}.ELF`);
        const popstartPath = path.resolve(popsPath, 'POPSTARTER.ELF');
        await copyFile(popstartPath, fullElfPath);

        const vcdFileName = `${nameWithGameId}.VCD`;

        // Do some the cue to pops (CUE/BIN to VCD) convertion
        const vcdPath = path.resolve(tmpDir, vcdFileName);
        await cue2pops(cuePath, vcdPath)

        // Copy the VCD file into the OPL root
        const vcdPathInPops = path.resolve(popsPath, vcdFileName);
        await copyFile(vcdPath, vcdPathInPops)
            .progress(progressCb || (() => {}));

        return {
            title: gameTitle,
            fullPath: vcdPathInPops,
            gameId
        };

    } catch (err) {
        throw err;
    } finally {
        if (tmpRemoveCb) {
            tmpRemoveCb();
        }
    }
}

export default addPsxBackup;