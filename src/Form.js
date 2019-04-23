import React, { Component } from 'react';
import { func, shape } from 'prop-types';
import invariant from 'invariant';
import { withValidators } from './ValidatorsContext';
import { FormProvider } from './FormContext';
import { areDirty, getFirstDefinedValue, removeFrom } from './utilities';

const propTypes = {
    onChange: func,
    onSubmit: func,
    onReset: func,
};

class Form extends Component {
    static defaultProps = {
        onChange: e => {},
        onSubmit: c => {},
        onReset: () => {},
    };

    static propTypes = {
        // OwnProps
        ...propTypes,
        // ValidatorsContext
        validators: shape({}).isRequired,
    };

    state = {
        config: {},
        errors: {},
        fields: {},
        submitted: false,
    };

    initialValues = {};

    onChange = e => {
        this.props.onChange(e);

        if (!this.state.config[e.target.name]) {
            return;
        }

        this.setField({
            [e.target.name]:
                e.target.type === 'checkbox'
                    ? e.target.checked
                    : e.target.value,
        });
    };

    onReset = e => {
        if (e) {
            e.preventDefault();
        }

        const { errors, fields } = this.state;

        this.setState({
            errors: Object.keys(errors).reduce(
                (allErrors, field) => ({
                    ...allErrors,
                    [field]: null,
                }),
                null,
            ),
            fields: Object.keys(fields).reduce(
                (allFields, field) => ({
                    ...allFields,
                    [field]: getFirstDefinedValue(
                        this.initialValues[field],
                        '',
                    ),
                }),
                null,
            ),
            submitted: false,
        });

        this.props.onReset();
    };

    onSubmit = e => {
        if (e) {
            e.preventDefault();
        }

        const { errors, fields } = this.state;

        this.setState({ submitted: true });

        this.props.onSubmit({
            dirty: areDirty(this.initialValues, fields),
            errors,
            fields,
            isValid: Object.values(errors).every(error => error === null),
            resetAll: this.onReset,
            setError: this.setError,
        });
    };

    setField = diff => {
        const fields = { ...this.state.fields, ...diff };

        this.setState({
            errors: this.validate(fields, this.state.config),
            fields,
            submitted: false,
        });
    };

    setError = diff => {
        this.setState({
            errors: {
                ...this.state.errors,
                ...diff,
            },
            submitted: false,
        });
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
                if (error) {
                    return error;
                }

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
                    isDirty: allFields[name] !== this.initialValues[name],
                };

                if (typeof validatorConfig === 'function') {
                    validatorConfig = validatorConfig(context);
                }

                if (typeof validatorConfig === 'string') {
                    validatorConfig = { message: validatorConfig };
                }

                if (
                    (typeof validatorConfig.validateIf === 'function' &&
                        !validatorConfig.validateIf(context)) ||
                    (typeof validatorConfig.validateIf === 'boolean' &&
                        !validatorConfig.validateIf)
                ) {
                    return null;
                }

                return validator(validatorConfig, context)(allFields[name]);
            },
            null,
        );

    registerSubComponent = (subComponentConfig, initialValues) => {
        this.initialValues = {
            ...this.initialValues,
            ...initialValues,
        };

        this.setState(prevState => {
            const config = {
                ...prevState.config,
                ...subComponentConfig,
            };
            const fields = {
                ...prevState.fields,
                ...initialValues,
            };

            return {
                config,
                fields,
                errors: this.validate(fields, config),
            };
        });
    };

    unregisterSubComponent = subComponentConfig => {
        const keys = Object.keys(subComponentConfig);

        this.initialValues = removeFrom(this.initialValues)(keys);

        this.setState(prevState => {
            const config = removeFrom(prevState.config)(keys);
            const fields = removeFrom(prevState.fields)(keys);

            return {
                config,
                errors: this.validate(fields, config),
                fields,
            };
        });
    };

    render() {
        const { children, onSubmit, ...rest } = this.props;
        const { errors, fields, submitted } = this.state;
        const formContext = {
            dirty: areDirty(this.initialValues, fields),
            errors,
            fields,
            register: this.registerSubComponent,
            resetAll: this.onReset,
            setError: this.setError,
            setField: this.setField,
            submit: this.onSubmit,
            submitted,
            unregister: this.unregisterSubComponent,
        };

        return (
            <form
                {...rest}
                onChange={this.onChange}
                onSubmit={this.onSubmit}
                onReset={this.onReset}
            >
                <FormProvider value={formContext}>{children}</FormProvider>
            </form>
        );
    }
}

const FormWithValidatorsContext = withValidators(Form);

FormWithValidatorsContext.propTypes = propTypes;

export default FormWithValidatorsContext;
