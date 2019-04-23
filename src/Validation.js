import React, { Component } from 'react';
import { bool, func, shape } from 'prop-types';
import { withFormContext } from './FormContext';
import { getFirstDefinedValue } from './utilities';

const propTypes = {
    children: func.isRequired,
    config: shape({}).isRequired,
    initialValues: shape({}),
};

class Validation extends Component {
    static defaultProps = {
        errors: {},
        fields: {},
        initialValues: {},
    };

    static propTypes = {
        // OwnProps
        ...propTypes,
        // FormContext
        dirty: shape({}),
        errors: shape({}),
        fields: shape({}),
        register: func.isRequired,
        resetAll: func.isRequired,
        setError: func.isRequired,
        setField: func.isRequired,
        submit: func.isRequired,
        submitted: bool,
        unregister: func.isRequired,
    };

    state = {
        isRegistered: false,
    };

    componentDidMount() {
        const { register, initialValues, config } = this.props;

        register(
            config,
            Object.keys(config).reduce(
                (allFields, field) => ({
                    ...allFields,
                    [field]: getFirstDefinedValue(initialValues[field], ''),
                }),
                {},
            ),
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
