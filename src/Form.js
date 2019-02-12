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
//Placeholders for logical validators
const logicalValidators = {
    validateIfFieldTrue: () => () => {},
    validateIfFieldFalse: () => () => {},
};

class Form extends Component {
    static defaultProps = {
        onSubmit: f => f,
        onReset: f => f,
        extendValidators: {},
    };

    static propTypes = {
        onSubmit: func,
        onReset: func,
        validators: shape({}).isRequired,
        extendValidators: shape({}),
    };

    constructor(props) {
        super(props);
        this.state = {
            config: {},
            errors: {},
            fields: {},
            submitted: false,
            validators: {
                ...props.validators,
                ...this.props.extendValidators,
                ...logicalValidators,
            },
        };
    }

    onChange = e => {
        if (!this.state.config[e.target.name]) {
            return;
        }
        const value =
            e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        const fields = {
            ...this.state.fields,
            [e.target.name]: value,
        };
        const errors = this.validate(fields, this.state.config);
        this.setState({ errors, fields });
    };

    onReset = e => {
        if (e) {
            e.preventDefault();
        }

        this.setState(prevState => ({
            submitted: false,
            errors: Object.keys(prevState.errors).reduce((acc, field) => ({
                ...acc,
                [field]: null,
            })),
            fields: Object.keys(prevState.fields).reduce((acc, field) => ({
                ...acc,
                [field]: '',
            })),
        }));

        this.props.onReset();
    };

    onSubmit = e => {
        if (e) {
            e.preventDefault();
        }
        this.setState({ submitted: true });
        const { errors, fields } = this.state;
        this.props.onSubmit({
            errors,
            fields,
            isValid: Object.values(errors).every(error => error === null),
            setErrors: this.setErrors,
        });
    };

    setField = diff => {
        const fields = { ...this.state.fields, ...diff };
        const errors = this.validate(fields, this.state.config);
        this.setState({ errors, fields });
    };

    setErrors = newErrors => {
        const errors = { ...this.state.errors, ...newErrors };
        this.setState({ errors });
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

    validateField = (fieldValidators, name, allFields, allErrors) => {
        //First determine if this field should even be validated
        const entries = Object.entries(fieldValidators);

        for (let [key, val] of entries) {
            if (key == 'validateIf' && typeof val === 'function' && !val()) {
                // console.log('validateIf skipped', name)
                return null;
            }

            if (
                key == 'validateIfFieldTrue' &&
                (!allFields[val] === false || allFields[val] === 'false')
            ) {
                console.log('validateIfFieldTrue skipped', name);
                return null;
            }

            if (
                key == 'validateIfFieldFalse' &&
                (allFields[val] === true || allFields[val] === 'true')
            ) {
                console.log('validateIfFieldFalse skipped', name);
                return null;
            }
        }

        //Now do validation run
        return entries.reduce((error, [validatorName, validatorConfig]) => {
            if (error) return error;

            const validator = this.state.validators[validatorName];

            invariant(
                validator,
                "You specified a validator that doesn't exist. You " +
                    `specified ${validatorName}. Available validators: \n\n` +
                    Object.keys(this.state.validators).join(',\n'),
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
                console.log('validation Skipped', validatorConfig);
                return null;
            } else if (
                typeof validatorConfig.validateIf === 'boolean' &&
                !validatorConfig.validateIf
            ) {
                return null;
            }

            return validator(validatorConfig, context)(allFields[name]);
        }, null);
    };

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

    /**
     * Useful for setting just-in-time validators i.e in a form's render func.
     */
    setValidators = (jitValidators = {}) => {
        this.setState({
            validators: { ...this.state.validators, ...jitValidators },
        });
    };

    render() {
        const { children, onSubmit, extendValidators, ...rest } = this.props;
        const formContext = {
            errors: this.state.errors,
            fields: this.state.fields,
            register: this.registerSubComponent,
            resetAll: this.onReset,
            setField: this.setField,
            setErrors: this.setErrors,
            submit: this.onSubmit,
            submitted: this.state.submitted,
            unregister: this.unregisterSubComponent,
            setValidators: this.setValidators,
        };
        return (
            <form
                onChange={this.onChange}
                onSubmit={this.onSubmit}
                onReset={this.onReset}
                {...rest}
            >
                <FormProvider value={formContext}>{children}</FormProvider>
            </form>
        );
    }
}

export default withValidators(Form);
