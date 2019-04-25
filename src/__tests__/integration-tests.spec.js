import React, { Fragment } from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { Form, Validation, FormValidation, ValidatorsProvider } from '..';

const ExampleForm = ({ fields, errors }) => (
    <Fragment>
        <div>
            <label>
                Username{' '}
                <input
                    name="username"
                    value={fields.username}
                    onChange={f => f}
                    data-testid="username"
                />
            </label>
            {errors.username && (
                <span data-testid="username-error">{errors.username}</span>
            )}
        </div>
        <div>
            <label>
                Email{' '}
                <input name="email" value={fields.email} onChange={f => f} />
            </label>
            {errors.email && (
                <span data-testid="email-error">{errors.email}</span>
            )}
        </div>
        <div>
            <label>
                Delayed{' '}
                <input
                    name="delayed"
                    value={fields.delayed}
                    onChange={f => f}
                />
            </label>
            {errors.delayed && (
                <span data-testid="delayed-error">{errors.delayed}</span>
            )}
        </div>
    </Fragment>
);

const exampleConfig = {
    username: {
        isRequired: 'username required',
    },
    email: {
        isRequired: 'email required',
        isEmail: 'email invalid',
    },
    delayed: {
        isRequired: {
            message: 'delayed invalid',
            validateIf: ({ isDirty }) => isDirty,
        },
    },
};

afterEach(cleanup);

describe('<FormValidation />', () => {
    it('runs validation on mount', () => {
        const { getByTestId } = render(
            <FormValidation config={exampleConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        expect(getByTestId('username-error')).not.toBeNull();
        expect(getByTestId('username-error').textContent).toBe(
            'username required',
        );

        expect(getByTestId('email-error')).not.toBeNull();
        expect(getByTestId('email-error').textContent).toBe('email required');
    });

    it('reruns validation on every change', () => {
        const { getByLabelText, getByTestId, queryByTestId } = render(
            <FormValidation config={exampleConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        expect(getByTestId('username-error').textContent).toBe(
            'username required',
        );
        expect(getByTestId('email-error').textContent).toBe('email required');
        expect(queryByTestId('delayed-error')).toBeNull();

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'my username' },
        });
        fireEvent.change(getByLabelText(/email/i), {
            target: { name: 'email', value: 'an invalid email' },
        });
        fireEvent.change(getByLabelText(/delayed/i), {
            target: { name: 'delayed', value: 'foo' },
        });

        expect(queryByTestId('username-error')).toBeNull();
        expect(getByTestId('email-error').textContent).toBe('email invalid');

        fireEvent.change(getByLabelText(/delayed/i), {
            target: { name: 'delayed', value: '' },
        });

        expect(getByTestId('delayed-error').textContent).toBe(
            'delayed invalid',
        );
    });

    it('calls the onSubmit prop with the correct params', () => {
        const submitSpy = jest.fn();
        const { container } = render(
            <FormValidation config={exampleConfig} onSubmit={submitSpy}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        fireEvent.submit(container.querySelector('form'));

        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(submitSpy).toHaveBeenCalledWith({
            dirty: {
                username: false,
                email: false,
                delayed: false,
            },
            errors: {
                username: 'username required',
                email: 'email required',
                delayed: null,
            },
            fields: { username: '', email: '', delayed: '' },
            isValid: false,
            resetAll: expect.any(Function),
            setError: expect.any(Function),
        });
    });

    it('lets you provide initial values', () => {
        const initialValues = { username: 'initial username' };
        const { getByLabelText, queryByTestId } = render(
            <FormValidation
                config={exampleConfig}
                initialValues={initialValues}
            >
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        expect(getByLabelText(/username/i).value).toBe('initial username');
        expect(queryByTestId('username-error')).toBeNull();
    });

    it('validates initial values', () => {
        const initialValues = { email: 'not an email' };
        const { getByLabelText, queryByTestId } = render(
            <FormValidation
                config={exampleConfig}
                initialValues={initialValues}
            >
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        expect(getByLabelText(/email/i).value).toBe('not an email');
        expect(queryByTestId('email-error').textContent).toBe('email invalid');

        fireEvent.change(getByLabelText(/email/i), {
            target: { name: 'email', value: '' },
        });

        expect(queryByTestId('email-error').textContent).toBe('email required');

        expect(getByLabelText(/delayed/i).value).toBe('');
        expect(queryByTestId('delayed-error')).toBeNull();
    });

    it('transforms values (initial & after change)', () => {
        const initialValues = { username: 'foo', delayed: '77' };
        const { getByLabelText, queryByTestId } = render(
            <FormValidation
                config={exampleConfig}
                initialValues={initialValues}
                transforms={{
                    username: value => value.toUpperCase(),
                    delayed: value => (parseInt(value) < 100 ? '0' : '1'),
                }}
            >
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        expect(getByLabelText(/username/i).value).toBe('FOO');

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'bar' },
        });

        expect(getByLabelText(/username/i).value).toBe('BAR');

        expect(getByLabelText(/delayed/i).value).toBe('0');

        fireEvent.change(getByLabelText(/delayed/i), {
            target: { name: 'delayed', value: '109' },
        });

        expect(getByLabelText(/delayed/i).value).toBe('1');
    });
});

describe('<ValidatorsProvider />', () => {
    it('enables custom validators', () => {
        const customConfig = {
            ...exampleConfig,
            username: {
                ...exampleConfig.username,
                isTheHoff: 'must be the Hoff',
            },
        };

        const hoffValidator = config => value =>
            value !== 'the hoff' ? config.message : null;
        const { getByLabelText, getByTestId, queryByTestId } = render(
            <ValidatorsProvider validators={{ isTheHoff: hoffValidator }}>
                <FormValidation config={customConfig}>
                    {props => <ExampleForm {...props} />}
                </FormValidation>
            </ValidatorsProvider>,
        );

        expect(getByTestId('username-error').textContent).toBe(
            'username required',
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'the boss' },
        });

        expect(getByTestId('username-error').textContent).toBe(
            'must be the Hoff',
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'the hoff' },
        });

        expect(queryByTestId('username-error')).toBeNull();
    });
});

const AnotherExampleForm = ({ fields, errors }) => (
    <Fragment>
        <div>
            <label>
                Favorite color{' '}
                <input
                    name="color"
                    value={fields.color}
                    onChange={f => f}
                    data-testid="color"
                />
            </label>
            {errors.color && (
                <span data-testid="color-error">{errors.color}</span>
            )}
        </div>
        <div>
            <label>
                Phone number{' '}
                <input
                    name="phoneNumber"
                    value={fields.phoneNumber}
                    onChange={f => f}
                    data-testid="phoneNumber"
                />
            </label>
            {errors.phoneNumber && (
                <span data-testid="phoneNumber-error">
                    {errors.phoneNumber}
                </span>
            )}
        </div>
    </Fragment>
);

const anotherExampleConfig = {
    color: {
        isRequired: 'color required',
    },
    phoneNumber: {
        isRequired: 'phone number required',
    },
};

const CompoundExampleForm = props => (
    <Form onSubmit={props.onSubmit}>
        <Validation config={exampleConfig}>
            {props => <ExampleForm {...props} />}
        </Validation>
        {props.showAnother && (
            <Validation config={anotherExampleConfig}>
                {props => <AnotherExampleForm {...props} />}
            </Validation>
        )}
    </Form>
);

describe('<Form> and <Validation /> side by side', () => {
    it('passes all errors down to all validation components', () => {
        const { getByTestId } = render(
            <CompoundExampleForm showAnother={true} />,
        );

        expect(getByTestId('username-error')).not.toBeNull();
        expect(getByTestId('email-error')).not.toBeNull();
        expect(getByTestId('color-error')).not.toBeNull();
        expect(getByTestId('phoneNumber-error')).not.toBeNull();
    });

    it('removes fields from the submit arguments if they are removed from the DOM', () => {
        const spy = jest.fn();
        const { container, getByLabelText } = render(
            <CompoundExampleForm onSubmit={spy} showAnother={true} />,
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'selbekk' },
        });
        fireEvent.change(getByLabelText(/color/i), {
            target: { name: 'color', value: 'red' },
        });
        fireEvent.submit(container.querySelector('form'));

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                fields: expect.objectContaining({
                    username: 'selbekk',
                    email: '',
                    color: 'red',
                    phoneNumber: '',
                }),
            }),
        );

        spy.mockReset();
        render(<CompoundExampleForm onSubmit={spy} showAnother={false} />, {
            container,
        });

        fireEvent.submit(container.querySelector('form'));

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                fields: {
                    username: 'selbekk',
                    email: '',
                    delayed: '',
                },
            }),
        );
    });
});

describe('passing in functions as validator configs', () => {
    it('receives errors and fields', () => {
        const functionalConfig = {
            username: {
                isMinLength: ({ fields, errors }) => ({
                    message: `"${fields.username}" is not 5 characters long`,
                    length: 5,
                }),
            },
            email: {
                isEqual: ({ fields, errors }) => ({
                    message: `The email must equal the username`,
                    value: fields.username,
                }),
            },
        };

        const { getByTestId, getByLabelText } = render(
            <FormValidation config={functionalConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'bork' },
        });
        fireEvent.change(getByLabelText(/email/i), {
            target: { name: 'email', value: 'not the username' },
        });

        expect(getByTestId('username-error')).not.toBeNull();
        expect(getByTestId('username-error').textContent).toBe(
            '"bork" is not 5 characters long',
        );

        expect(getByTestId('email-error')).not.toBeNull();
        expect(getByTestId('email-error').textContent).toBe(
            'The email must equal the username',
        );
    });
});

describe('validateIf config property', () => {
    const validateIfConfig = {
        username: {
            isMinLength: ({ fields }) => ({
                message: `"${fields.username}" is not 5 characters long`,
                length: 5,
            }),
        },
        email: {
            isRequired: {
                validateIf: ({ fields }) => fields.username.length > 5,
                message: 'email is required for long usernames',
            },
        },
    };

    const validateIfWithBooleanConfig = {
        ...validateIfConfig,
        email: {
            isRequired: ({ fields }) => ({
                validateIf: fields.username.length > 5,
                message: 'email is required for long usernames',
            }),
        },
    };

    it('runs validator if it returns true', () => {
        const { queryByTestId, getByLabelText } = render(
            <FormValidation config={validateIfConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'borkybork' },
        });

        expect(queryByTestId('email-error')).not.toBeNull();
        expect(queryByTestId('email-error').textContent).toBe(
            'email is required for long usernames',
        );
    });

    it('skips validator if it returns false', () => {
        const { queryByTestId, getByLabelText } = render(
            <FormValidation config={validateIfConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'bork' },
        });

        expect(queryByTestId('username-error')).not.toBeNull();
        expect(queryByTestId('username-error').textContent).toBe(
            '"bork" is not 5 characters long',
        );

        expect(queryByTestId('email-error')).toBeNull();
    });

    it('runs validator if it is true', () => {
        const { queryByTestId, getByLabelText } = render(
            <FormValidation config={validateIfWithBooleanConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'borkybork' },
        });

        expect(queryByTestId('email-error')).not.toBeNull();
        expect(queryByTestId('email-error').textContent).toBe(
            'email is required for long usernames',
        );
    });

    it('skips validator if it is false', () => {
        const { queryByTestId, getByLabelText } = render(
            <FormValidation config={validateIfWithBooleanConfig}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        fireEvent.change(getByLabelText(/username/i), {
            target: { name: 'username', value: 'bork' },
        });

        expect(queryByTestId('email-error')).toBeNull();
    });
});

describe('resetting', () => {
    it('resets the submitted flag, and all fields and errors', () => {
        const { container, queryByTestId } = render(
            <FormValidation config={exampleConfig}>
                {props => (
                    <React.Fragment>
                        <ExampleForm {...props} />
                        <button data-testid="reset" onClick={props.resetAll}>
                            Reset
                        </button>
                    </React.Fragment>
                )}
            </FormValidation>,
        );
        fireEvent.submit(container.querySelector('form'));
        expect(queryByTestId('email-error')).not.toBeNull();
        fireEvent.click(queryByTestId('reset'));
        expect(queryByTestId('email-error')).toBeNull();
    });
});

describe('setting errors', () => {
    it('sets the error programmatically from onSubmit', async () => {
        const handleSubmit = ({ setError }) => {
            setError({ email: "i don't like your email" });
        };
        const { container, getByTestId } = render(
            <FormValidation config={exampleConfig} onSubmit={handleSubmit}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );
        fireEvent.submit(container.querySelector('form'));

        expect(getByTestId('email-error').textContent).toBe(
            "i don't like your email",
        );
    });
});
