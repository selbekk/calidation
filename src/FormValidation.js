import React from 'react';
import { func, shape } from 'prop-types';

import Form from './Form';
import Validation from './Validation';

const FormValidation = props => {
    const { children, config, initialValues, onSubmit, ...rest } = props;

    return (
        <Form onSubmit={onSubmit} {...rest}>
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
    extendValidators: shape({}),
    onSubmit: func,
};

export default FormValidation;
