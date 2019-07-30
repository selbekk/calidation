import React, { Component } from 'react';
import { func, shape } from 'prop-types';
import invariant from 'invariant';

import { withValidators } from './ValidatorsContext';
import { FormProvider } from './FormContext';
import { removeFrom } from './utilities';

const propTypes = {
    onChange: func,
    onReset: func,
    onSubmit: func,
    onUpdate: func,
};

class Form extends Component {
    static defaultProps = {
        onChange: e => {},
        onReset: () => {},
        onSubmit: c => {},
        onUpdate: c => {},
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

    getContext = () => {
        const { dirty, errors, fields, submitted } = this.state;

        return {
            dirty,
            errors,
            fields,
            isValid: Object.values(errors).every(error => error === null),
            resetAll: this.onReset,
            setError: this.setError,
            setField: this.setField,
            submit: this.onSubmit,
            submitted,
        };
    };

    onChange = e => {
        this.props.onChange(e);

        const { checked, name, type, value } = e.target;

        if (e.defaultPrevented || !this.state.config[name]) {
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

        this.setStateInternal(
            ({ dirty, errors, fields }) => ({
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
            }),
            this.props.onReset,
        );
    };

    onSubmit = e => {
        if (e) {
            e.preventDefault();
        }

        this.setStateInternal({ submitted: true }, () => {
            this.props.onSubmit(this.getContext());
        });
    };

    setError = diff => {
        this.setStateInternal(({ errors }) => ({
            errors: {
                ...errors,
                ...diff,
            },
        }));
    };

    setField = diff => {
        this.setStateInternal(({ config, dirty, fields }) => {
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
            return {
                dirty: areDirty,
                errors: this.validate(config, allFields, areDirty),
                fields: allFields,
            };
        });
    };

    setStateInternal = (updater, callback = () => {}) => {
        this.setState(updater, (...args) => {
            callback(...args);

            this.props.onUpdate(this.getContext());
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
    ) => {
        const { validators } = this.props;

        // if field is optional and the value doesn't pass the isRequired validator, skip all validators
        if (
            !fieldValidators.isRequired &&
            validators.isRequired({})(allFields[fieldName]) !== null
        ) {
            return null;
        }

        return Object.entries(fieldValidators).reduce(
            (error, [validatorName, validatorConfig]) => {
                if (error) {
                    return error;
                }

                const validator = validators[validatorName];

                invariant(
                    validator,
                    "You specified a validator that doesn't exist. You " +
                        `specified ${validatorName}. Available validators: \n\n` +
                        Object.keys(validators).join(',\n'),
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
    };

    registerSubComponent = (subComponentConfig, transforms, initialValues) => {
        this.initialValues = {
            ...this.initialValues,
            ...initialValues,
        };
        this.transforms = {
            ...this.transforms,
            ...transforms,
        };

        this.setStateInternal(prevState => {
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

        this.setStateInternal(prevState => {
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
        const { children, onSubmit, onUpdate, ...rest } = this.props;
        const formContext = {
            ...this.getContext(),
            register: this.registerSubComponent,
            unregister: this.unregisterSubComponent,
        };

        return (
            <form
                {...rest}
                noValidate
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
