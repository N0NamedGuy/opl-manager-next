import fs from 'fs';

function deleteFile(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    })
}

export default deleteFile;