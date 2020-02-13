import settings from 'electron-settings';
import { exec } from 'child_process';

const cue2popsBin = settings.get('cue2popsBin');

function cue2pops(cuePath, vcdPath) {
    const cmd = `${cue2popsBin} "${cuePath}" "${vcdPath}"`;

    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            // cue2pops returns error if things go well??
            if (error) {
                if (error.code === 1) {
                    resolve(stdout);
                } else {
                    reject({
                        error,
                        stdout,
                        stderr
                    });
                }
            }
        });
    });
}

export default cue2pops;