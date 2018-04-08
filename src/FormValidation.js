import React from 'react';
import { func, shape } from 'prop-types';

import Form from './Form';
import Validation from './Validation';

const FormValidation = props => {
    const { children, config, initialValues, onSubmit } = props;

    return (
        <Form onSubmit={onSubmit}>
            <Validation config={config} initialValues={initialValues}>
                {children}
            </Validation>
        </Form>
    );
};

FormValidation.propTypes = {
    children: func.isRequired,
    config: shape({}).isRequired,
    initialValues: shape({}),
    onSubmit: func,
};

export default FormValidation;
