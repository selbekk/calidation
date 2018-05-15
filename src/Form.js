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
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const fields = {
            ...this.state.fields,
            [e.target.name]: value,
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
            (allErrors, [name, fieldConfig]) => ({
                ...allErrors,
                [name]: this.validateField(
                    fieldConfig,
                    name,
                    fields,
                    allErrors,
                ),
            }),
            {},
        );

    validateField = (fieldValidators, name, allFields, allErrors) =>
        Object.entries(fieldValidators).reduce(
            (error, [validatorName, validatorConfig]) => {
                if (error) return error;

                const validator = this.props.validators[validatorName];
                invariant(
                    validator,
                    "You specified a validator that doesn't exist. You " +
                        `specified ${validatorName}. Available validators: \n\n` +
                        Object.keys(this.props.validators).join(',\n'),
                );

                const context = {
                    fields: allFields,
                    errors: { ...this.state.errors, ...allErrors },
                };

                if (typeof validatorConfig === 'function') {
                    validatorConfig = validatorConfig(context);
                }

                if (typeof validatorConfig === 'string') {
                    validatorConfig = { message: validatorConfig };
                }

                if (
                    typeof validatorConfig.validateIf === 'function' &&
                    !validatorConfig.validateIf(context)
                ) {
                    return null;
                } else if (
                    typeof validatorConfig.validateIf === 'boolean' &&
                    !validatorConfig.validateIf
                ) {
                    return null;
                }

                return validator(validatorConfig)(allFields[name]);
            },
            null,
        );

    registerSubComponent = (subComponentConfig, initialValues) => {
        const config = { ...this.state.config, ...subComponentConfig };
        const fields = { ...this.state.fields, ...initialValues };
        const errors = this.validate(fields, config);

        this.setState(prevState => ({
            config: {
                ...prevState.config,
                ...config,
            },
            fields: {
                ...prevState.fields,
                ...fields,
            },
            errors: {
                ...prevState.errors,
                ...errors,
            },
        }));
    };

    unregisterSubComponent = fieldsToRemove => {
        const keys = Object.keys(fieldsToRemove);
        const fields = removeFrom(this.state.fields)(keys);
        const config = removeFrom(this.state.config)(keys);
        const errors = removeFrom(this.state.errors)(keys);

        this.setState({
            config,
            errors: this.validate(fields, config),
            fields,
        });
    };

    render() {
        const { children } = this.props;
        const formContext = {
            errors: this.state.errors,
            fields: this.state.fields,
            register: this.registerSubComponent,
            setField: this.setField,
            submitted: this.state.submitted,
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
