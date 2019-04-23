import React, { createContext } from 'react';

const { Consumer, Provider } = createContext({});

export const FormProvider = Provider;
export const FormConsumer = Consumer;

export const withFormContext = TargetComponent => {
    const WithFormContext = props => (
        <Consumer>
            {formContext => <TargetComponent {...props} {...formContext} />}
        </Consumer>
    );
    const targetName = TargetComponent.displayName || TargetComponent.name;

    WithFormContext.displayName = `withFormContext(${targetName})`;

    return WithFormContext;
};
