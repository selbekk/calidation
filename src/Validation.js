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

    getFields = source => {
        const { config } = this.props;

        return Object.keys(config).reduce(
            (allFields, field) => ({
                ...allFields,
                [field]: getFirstDefinedValue(source[field], ''),
            }),
            {},
        );
    };

    componentDidMount() {
        const { register, initialValues, config } = this.props;

        register(config, this.getFields(initialValues));
    }

    componentWillUnmount() {
        this.props.unregister(this.props.config);
    }

    render() {
        const {
            children,
            errors,
            fields,
            resetAll,
            setError,
            setField,
            submit,
            submitted,
        } = this.props;

        const childrenArgs = {
            errors,
            fields: this.getFields(fields),
            resetAll,
            setError,
            setField,
            submit,
            submitted,
        };

        return children(childrenArgs);
    }
}

const ValidationWithFormContext = withFormContext(Validation);

ValidationWithFormContext.propTypes = propTypes;

export default ValidationWithFormContext;
