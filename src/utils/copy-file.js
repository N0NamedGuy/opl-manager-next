import fs from 'fs';
import ProgressPromise from 'progress-promise';

function copyFile(source, dest) {
    return new ProgressPromise((resolve, reject, progress) => {
        let copied = 0;

        fs.stat(source, (error, { size }) => {
            if (error) {
                reject(error);
                return;
            }

            fs.createReadStream(source)
                .on('data', (buffer) => {
                    copied += buffer.length;

                    // TODO: add speed stat
                    progress({
                        size,
                        copied,
                        percent: ((copied / size) * 100).toFixed(2)
                    });
                })
                .on('end', resolve)
                .pipe(fs.createWriteStream(dest));
        })

    });

}

export default copyFile;