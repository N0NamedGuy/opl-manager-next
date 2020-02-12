import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';

import { readdir } from 'fs';
import path from 'path';

const POPSManager = () => {
    const [rootPath, setRootPath] = useState('/run/user/1000/gvfs/smb-share:server=192.168.1.60,share=ps2smb');
    const [fileList, setFileList] = useState(['a']);

    useEffect(() => {
        readdir(rootPath, (err, files) => {
            setFileList(files);
            console.log('got files', files);
        });

    }, [rootPath]);

    function navigateTo(file) {
        setRootPath((rootPath) => {
            return path.resolve(rootPath, file);
        })
    }

    return (<Container>
        <Card>
            <Card.Body>
                <Card.Title onClick={() => navigateTo('..')}>[..]</Card.Title>
            </Card.Body>
        </Card>
        {
            fileList.map((file, i) => {
                return (<Card key={i}>
                    <Card.Body>
                        <Card.Title onClick={() => navigateTo(file)}>{file}</Card.Title>
                    </Card.Body>
                </Card>);
            })
        }
    </Container>)
};

export default POPSManager;