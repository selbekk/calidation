import React, { Component } from 'react';
import { func, shape } from 'prop-types';
import invariant from 'invariant';
import { withValidators } from './ValidatorsContext';
import { FormProvider } from './FormContext';
import { removeFrom } from './utilities';

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
        dirty: {},
        errors: {},
        fields: {},
        submitted: false,
    };

    initialValues = {};
    transforms = {};

    onChange = e => {
        this.props.onChange(e);

        const { checked, name, type, value } = e.target;

        if (!this.state.config[name]) {
            return;
        }

        let val = type === 'checkbox' ? checked : value;

        if (typeof this.transforms[name] === 'function') {
            val = this.transforms[name](val);
        }

        this.setField({ [name]: val });
    };

    onReset = e => {
        if (e) {
            e.preventDefault();
        }

        const { dirty, errors, fields } = this.state;

        this.setState({
            dirty: Object.keys(dirty).reduce(
                (allDirty, field) => ({
                    ...allDirty,
                    [field]: false,
                }),
                {},
            ),
            errors: Object.keys(errors).reduce(
                (allErrors, field) => ({
                    ...allErrors,
                    [field]: null,
                }),
                {},
            ),
            fields: Object.keys(fields).reduce(
                (allFields, field) => ({
                    ...allFields,
                    [field]: this.initialValues[field],
                }),
                {},
            ),
            submitted: false,
        });

        this.props.onReset();
    };

    onSubmit = e => {
        if (e) {
            e.preventDefault();
        }

        const { dirty, errors, fields } = this.state;

        this.setState({ submitted: true });

        this.props.onSubmit({
            dirty,
            errors,
            fields,
            isValid: Object.values(errors).every(error => error === null),
            resetAll: this.onReset,
            setError: this.setError,
        });
    };

    setField = diff => {
        const { config, dirty, fields } = this.state;
        const allFields = { ...fields, ...diff };
        const areDirty = {
            ...dirty,
            ...Object.keys(diff).reduce(
                (allDirty, field) => ({
                    ...allDirty,
                    [field]:
                        dirty[field] ||
                        diff[field] !== this.initialValues[field],
                }),
                {},
            ),
        };

        this.setState({
            dirty: areDirty,
            errors: this.validate(config, allFields, areDirty),
            fields: allFields,
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

    validate = (allConfig, allFields, areDirty) =>
        Object.entries(allConfig).reduce(
            (allErrors, [fieldName, fieldValidators]) => ({
                ...allErrors,
                [fieldName]: this.validateField(
                    fieldName,
                    fieldValidators,
                    allFields,
                    allErrors,
                    areDirty,
                ),
            }),
            {},
        );

    validateField = (
        fieldName,
        fieldValidators,
        allFields,
        allErrors,
        areDirty,
    ) =>
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
                    isDirty: areDirty[fieldName],
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

                return validator(validatorConfig, context)(
                    allFields[fieldName],
                );
            },
            null,
        );

    registerSubComponent = (subComponentConfig, transforms, initialValues) => {
        this.initialValues = {
            ...this.initialValues,
            ...initialValues,
        };
        this.transforms = {
            ...this.transforms,
            ...transforms,
        };

        this.setState(prevState => {
            const config = {
                ...prevState.config,
                ...subComponentConfig,
            };
            const dirty = {
                ...prevState.dirty,
                ...Object.keys(subComponentConfig).reduce(
                    (allDirty, field) => ({
                        ...allDirty,
                        [field]: false,
                    }),
                    {},
                ),
            };
            const fields = {
                ...prevState.fields,
                ...initialValues,
            };

            return {
                config,
                dirty,
                errors: this.validate(config, fields, dirty),
                fields,
            };
        });
    };

    unregisterSubComponent = subComponentConfig => {
        const keys = Object.keys(subComponentConfig);

        this.initialValues = removeFrom(this.initialValues)(keys);
        this.transforms = removeFrom(this.transforms)(keys);

        this.setState(prevState => {
            const config = removeFrom(prevState.config)(keys);
            const dirty = removeFrom(prevState.dirty)(keys);
            const fields = removeFrom(prevState.fields)(keys);

            return {
                config,
                dirty,
                errors: this.validate(config, fields, dirty),
                fields,
            };
        });
    };

    render() {
        const { children, onSubmit, ...rest } = this.props;
        const { dirty, errors, fields, submitted } = this.state;
        const formContext = {
            dirty,
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
