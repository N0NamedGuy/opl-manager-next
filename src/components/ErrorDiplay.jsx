import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
const ErrorDisplay = ({ error }) => {
    if (!error) {
        return null;
    }

    return <Alert variant="danger">
        {error.description}
        
        {error.cta && <p><small>{error.cta.description}</small></p>}

        {error.cta && <p><LinkContainer to={error.cta.route}>
            <Button>{error.cta.label}</Button>
        </LinkContainer></p>}
    </Alert>
}

export default ErrorDisplay;