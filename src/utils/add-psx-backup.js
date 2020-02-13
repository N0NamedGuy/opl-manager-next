import path from 'path';
import tmp from 'tmp-promise';
import getPSXGameId from './get-psx-game-id.js';
import cue2pops from './cue2pops.js';
import copyFile from './copy-file.js';

async function addPsxBackup(cuePath, {oplRoot }) {
    // Holder for temporary files removal fn
    // even if stuff went wrong
    let tmpRemoveCb;

    try {
        const cueName = path.parse(cuePath).name;

        // TODO: make sure cuePath game name is LESS than 32 chars 
        // and prompt the user for another name
        // For now we just quit
        if (cueName.length > 32) {
            throw new Error('Cue filename is too long');
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

        const vcdName = `${gameId}.${cueName}`;
        const vcdFileName = `${vcdName}.VCD`;

        // Do some the cue to pops (CUE/BIN to VCD) convertion
        const vcdPath = path.resolve(tmpDir, vcdFileName);
        await cue2pops(cuePath, vcdPath)

        // Copy the VCD file into the OPL root
        const popsPath = path.resolve(oplRoot, 'POPS');
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

export default addPsxBackup;