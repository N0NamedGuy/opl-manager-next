import { createReadStream } from 'fs';
import { parse as cueParse } from 'cue-parser';
import { resolve as pathResolve, dirname } from 'path';

function getPsxGameId(cueFile) {
    return new Promise((resolve, reject) => {
        const cueSheet = cueParse(cueFile);
        const binFile = cueSheet.files.find((file) =>
            file.type.toUpperCase() === 'BINARY'
        );

        const stream = createReadStream(pathResolve(dirname(cueFile), binFile.name), {
            start: 0x9340,
            end: 0x935f
        });

        let gameIdBuf = '';

        stream
            .on('error', (error) => {
                reject(error);
            })
            .on('data', (data) => {
                gameIdBuf += data;
            })
            .on('close', () => {
                const gameIdBufTrimmed = gameIdBuf.toString().trim();
                const gameId =
                    `${gameIdBufTrimmed.substring(0, 8)}.${gameIdBufTrimmed.substring(8)}`;

                resolve(gameId);
            });
    });
}

export default getPsxGameId;