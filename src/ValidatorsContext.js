import React, { Component, createContext } from 'react';
import { shape } from 'prop-types';
import {
    isBlacklisted,
    isEmail,
    isEqual,
    isGreaterThan,
    isLessThan,
    isRequired,
    isNumber,
    isRegexMatch,
    isWhitelisted,
    isMinLength,
    isMaxLength,
    isExactLength,
} from 'calidators';

const defaultValidators = {
    isBlacklisted,
    isEmail,
    isEqual,
    isGreaterThan,
    isLessThan,
    isRequired,
    isNumber,
    isRegexMatch,
    isWhitelisted,
    isMinLength,
    isMaxLength,
    isExactLength,
};

const { Provider, Consumer } = createContext({});

export class ValidatorsProvider extends Component {
    static getDerivedStateFromProps(nextProps) {
        return nextProps.validators || null;
    }

    static defaultProps = {
        validators: {},
    };

    static propTypes = {
        validators: shape({}),
    };

    state = { ...this.props.validators };

    render() {
        return <Provider value={this.state}>{this.props.children}</Provider>;
    }
}

export const ValidatorsConsumer = Consumer;

export const withValidators = TargetComponent => {
    const WithValidators = props => (
        <Consumer>
            {validators => (
                <TargetComponent
                    {...props}
                    validators={{ ...defaultValidators, ...validators }}
                />
            )}
        </Consumer>
    );
    const targetName = TargetComponent.displayName || TargetComponent.name;
    WithValidators.displayName = `withValidators(${targetName})`;
    return WithValidators;
};
