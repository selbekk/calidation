import React, { Component } from 'react';
import { func, shape } from 'prop-types';
import invariant from 'invariant';
import { withValidators } from './ValidatorsContext';
import { FormProvider } from './FormContext';

const removeFrom = original => fieldsToRemove =>
    Object.entries(original)
        .filter(([fieldName]) => !fieldsToRemove.includes(fieldName))
        .reduce(
            (all, [fieldName, fieldValue]) => ({
                ...all,
                [fieldName]: fieldValue,
            }),
            {},
        );

class Form extends Component {
    static defaultProps = {
        onSubmit: f => f,
    };

    static propTypes = {
        onSubmit: func,
        validators: shape({}).isRequired,
    };

    state = {
        config: {},
        errors: {},
        fields: {},
        submitted: false,
    };

    onChange = e => {
        const fields = {
            ...this.state.fields,
            [e.target.name]: e.target.value,
        };
        const errors = this.validate(fields, this.state.config);
        this.setState({ errors, fields });
    };

    onSubmit = e => {
        e.preventDefault();
        this.setState({ submitted: true });
        const { errors, fields } = this.state;
        this.props.onSubmit({
            errors,
            fields,
            isValid: Object.values(errors).every(error => error === null),
        });
    };

    setField = diff => {
        const fields = { ...this.state.fields, ...diff };
        const errors = this.validate(fields, this.state.config);
        this.setState({ errors, fields });
    };

    validate = (fields, config) =>
        Object.entries(config).reduce(
            (all, [name, fieldConfig]) => ({
                ...all,
                [name]: this.validateField(fieldConfig, name, fields),
            }),
            {},
        );

    validateField = (fieldValidators, name, allFields) =>
        Object.entries(fieldValidators).reduce(
            (error, [validatorName, validatorConfig]) => {
                if (error) return error;

                if (typeof validatorConfig === 'string') {
                    validatorConfig = { message: validatorConfig };
                }

                const validator = this.props.validators[validatorName];
                invariant(
                    validator,
                    "You specified a validator that doesn't exist. You " +
                        `specified ${validatorName}. Available validators: \n\n` +
                        Object.keys(this.props.validators).join(',\n'),
                );

                return validator(validatorConfig)(allFields[name]);
            },
            null,
        );

    registerSubComponent = (subComponentConfig, initialValues) => {
        const config = { ...this.state.config, ...subComponentConfig };
        const fields = { ...this.state.fields, ...initialValues };
        const errors = this.validate(fields, config);

        this.setState({ config, fields, errors });
    };

    unregisterSubComponent = fieldsToRemove => {
        const keys = Object.keys(fieldsToRemove);
        const fields = removeFrom(this.state.fields)(keys);
        const config = removeFrom(this.state.config)(keys); // TODO: Revalidate errors?
        const errors = removeFrom(this.state.errors)(keys);

        this.setState({
            config,
            errors,
            fields,
        });
    };

    render() {
        const { children } = this.props;
        const formContext = {
            errors: this.state.errors,
            fields: this.state.fields,
            submitted: this.state.submitted,
            setField: this.setField,
            register: this.registerSubComponent,
            unregister: this.unregisterSubComponent,
        };
        return (
            <form onChange={this.onChange} onSubmit={this.onSubmit}>
                <FormProvider value={formContext}>{children}</FormProvider>
            </form>
        );
    }
}

export default withValidators(Form);
