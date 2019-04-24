import React from 'react';

import Form from './Form';
import Validation from './Validation';

const FormValidation = props => {
    const { children, config, initialValues, transforms, ...rest } = props;

    return (
        <Form {...rest}>
            <Validation
                config={config}
                initialValues={initialValues}
                transforms={transforms}
            >
                {children}
            </Validation>
        </Form>
    );
};

FormValidation.propTypes = {
    ...Form.propTypes,
    ...Validation.propTypes,
};

export default FormValidation;
