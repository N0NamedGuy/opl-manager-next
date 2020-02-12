import { Formik } from 'formik';
import React, { useContext } from 'react';
import { Container, Form, FormGroup, FormLabel } from 'react-bootstrap';
import AppSettingsContext from '../contexts/AppSettingsContext.jsx';
import FileSelect from './FileSelect.jsx';
import { Button } from 'react-bootstrap';

const Settings = () => {
    const AppSettings = useContext(AppSettingsContext);

    function onSubmit(values, { setSubmitting }) {
        AppSettings.setSetting('cue2popsBin', values.cue2popsBinPath);
        AppSettings.setSetting('oplRoot', values.oplRoot);
        setSubmitting(false);
    }

    return (<Container>
        <Formik
            initialValues={{
                cue2popsBinPath: AppSettings.settings.cue2popsBin || '',
                oplRoot: AppSettings.settings.oplRoot || ''
            }}
            onSubmit={onSubmit}>{
                ({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting
                }) =>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <FormLabel>OPL root</FormLabel>
                            <FileSelect name="oplRoot" />
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>cue2pops binary path</FormLabel>
                            <FileSelect name="cue2popsBinPath" />
                        </FormGroup>

                        <Button variant="primary" type="submit">
                            Save changes
                        </Button>
                    </Form>

            }</Formik>
    </Container>);
};

export default Settings;