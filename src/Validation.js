import React, { Component } from 'react';
import { bool, func, shape } from 'prop-types';
import { withFormContext } from './FormContext';
import { getFirstDefinedValue } from './utilities';

const propTypes = {
    children: func.isRequired,
    config: shape({}).isRequired,
    initialValues: shape({}),
    transforms: shape({}),
};

class Validation extends Component {
    static defaultProps = {
        errors: {},
        fields: {},
        initialValues: {},
        transforms: {},
    };

    static propTypes = {
        // OwnProps
        ...propTypes,
        // FormContext
        dirty: shape({}).isRequired,
        errors: shape({}).isRequired,
        fields: shape({}).isRequired,
        isValid: bool.isRequired,
        register: func.isRequired,
        resetAll: func.isRequired,
        setError: func.isRequired,
        setField: func.isRequired,
        submit: func.isRequired,
        submitted: bool.isRequired,
        unregister: func.isRequired,
    };

    state = {
        isRegistered: false,
    };

    componentDidMount() {
        const { config, initialValues, register, transforms } = this.props;

        register(
            config,
            transforms,
            Object.keys(config).reduce((allFields, field) => {
                let value = getFirstDefinedValue(initialValues[field], '');

                if (typeof transforms[field] === 'function') {
                    value = transforms[field](value);
                }

                return {
                    ...allFields,
                    [field]: value,
                };
            }, {}),
        );

        this.setState({ isRegistered: true });
    }

    componentWillUnmount() {
        this.props.unregister(this.props.config);

        this.setState({ isRegistered: false });
    }

    render() {
        const {
            children,
            dirty,
            errors,
            fields,
            isValid,
            resetAll,
            setError,
            setField,
            submit,
            submitted,
        } = this.props;
        const validationContext = {
            dirty,
            errors,
            fields,
            isValid,
            resetAll,
            setError,
            setField,
            submit,
            submitted,
        };

        return this.state.isRegistered ? children(validationContext) : null;
    }
}

const ValidationWithFormContext = withFormContext(Validation);

ValidationWithFormContext.propTypes = propTypes;

export default ValidationWithFormContext;
