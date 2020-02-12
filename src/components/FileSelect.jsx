import React from 'react';
import { Field } from 'formik';

import { remote } from 'electron';
import { Button } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';

const FileSelect = ({ options, ...otherProps }) =>
    <Field {...otherProps}>{
        ({ field, form, meta }) => {

            function selectFile() {
                remote.dialog.showOpenDialog(options)
                    .then(({ filePaths, canceled }) => {
                        if (!canceled) {
                            form.setFieldValue(field.name, filePaths[0]);
                        }
                    })
            }

            return <InputGroup>
                <FormControl type="text" {...field} readOnly />
                <InputGroup.Append>
                    <Button onClick={() => selectFile()}>Select file</Button>
                </InputGroup.Append>
            </InputGroup>
        }
    }</Field>
    ;

export default FileSelect;