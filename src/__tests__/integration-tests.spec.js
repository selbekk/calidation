import React, { Fragment } from 'react';
import { render, Simulate } from 'react-testing-library';

import { FormValidation, ValidatorsProvider } from '..';

const ExampleForm = ({ fields, errors }) => (
    <Fragment>
        <div>
            <label>
                Username{' '}
                <input
                    name="username"
                    value={fields.username}
                    onChange={f => f}
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
        <button>Submit</button>
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
};

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

        Simulate.change(getByLabelText('username'), {
            target: { name: 'username', value: 'my username' },
        });
        Simulate.change(getByLabelText('email'), {
            target: { name: 'email', value: 'an invalid email' },
        });

        expect(queryByTestId('username-error')).toBeNull();
        expect(getByTestId('email-error').textContent).toBe('email invalid');
    });

    it('calls the onSubmit prop with the correct params', () => {
        const submitSpy = jest.fn();
        const { container, getByTestId } = render(
            <FormValidation config={exampleConfig} onSubmit={submitSpy}>
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        Simulate.submit(container.querySelector('form'));

        expect(submitSpy).toHaveBeenCalledTimes(1);
        const submitArgs = submitSpy.mock.calls[0][0];
        expect(submitSpy).toHaveBeenCalledWith({
            errors: { username: 'username required', email: 'email required' },
            fields: { username: '', email: '' },
            isValid: false,
        });
    });

    it('lets you provide initial values', () => {
        const initialValues = { username: 'test username' };
        const { container, getByLabelText, queryByTestId } = render(
            <FormValidation
                config={exampleConfig}
                initialValues={initialValues}
            >
                {props => <ExampleForm {...props} />}
            </FormValidation>,
        );

        expect(getByLabelText('username').value).toBe('test username');
        expect(queryByTestId('username-error')).toBeNull();
    });
});

describe('<ValidatorsProvider />', () => {
    it('enables custom validators', () => {
        const customConfig = { ...exampleConfig };
        customConfig.username.isTheHoff = 'must be the Hoff';

        const hoffValidator = config => value =>
            value !== 'the hoff' ? config.message : null;
        const {
            container,
            getByLabelText,
            getByTestId,
            queryByTestId,
        } = render(
            <ValidatorsProvider validators={{ isTheHoff: hoffValidator }}>
                <FormValidation config={customConfig}>
                    {props => <ExampleForm {...props} />}
                </FormValidation>
            </ValidatorsProvider>,
        );

        expect(getByTestId('username-error').textContent).toBe(
            'username required',
        );

        Simulate.change(getByLabelText('username'), {
            target: { name: 'username', value: 'the boss' },
        });

        expect(getByTestId('username-error').textContent).toBe(
            'must be the Hoff',
        );

        Simulate.change(getByLabelText('username'), {
            target: { name: 'username', value: 'the hoff' },
        });

        expect(queryByTestId('username-error')).toBeNull();
    });
});
