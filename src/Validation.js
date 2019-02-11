import React, { Component } from 'react';
import { bool, func, shape } from 'prop-types';
import { withFormContext } from './FormContext';

class Validation extends Component {
    static defaultProps = {
        errors: {},
        fields: {},
        initialValues: {},
    };

    static propTypes = {
        config: shape({}).isRequired,
        errors: shape({}),
        fields: shape({}),
        register: func,
        resetAll: func,
        submitted: bool,
        submit: func,
        unregister: func,
        setErrors: func,
        setValidators: func,
    };

    getFields = source => {
        const { config } = this.props;
        const getFirstDefinedValue = (...values) =>
            values.find(value => value !== undefined);
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

    // componentWillReceiveProps(props) {
    //     const { register, initialValues, config } = props;
    //     register(config, this.getFields(initialValues));
    // }

    componentWillUnmount() {
        this.props.unregister(this.props.config);
    }
    render() {
        const {
            errors,
            fields,
            resetAll,
            submit,
            submitted,
            children,
            config,
            setField,
            setErrors,
            setValidators,
        } = this.props;

        const childrenArgs = {
            errors,
            fields: this.getFields(fields),
            resetAll,
            submit,
            submitted,
            setField,
            setErrors,
            setValidators,
        };

        return children(childrenArgs);
    }
}

export default withFormContext(Validation);
