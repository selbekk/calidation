import React, { Component, createContext } from "react";
import { shape } from "prop-types";

const defaultValidators = {
  isRequired: config => value => (value === "" ? config.message : null),
  isNumber: config => value => (isNaN(value) ? config.message : null),
  isGreaterThan: config => value =>
    Number(value) > config.value ? config.message : null,
  isLessThan: config => value =>
    Number(value) < config.value ? config.message : null,
  isEqualTo: config => value => (value === config.value ? config.message : null)
};

const { Provider, Consumer } = createContext({});

export class ValidatorsProvider extends Component {
  static getDerivedStateFromProps(nextProps) {
    return nextProps.validators || null;
  }
  static defaultProps = {
    validators: {}
  };
  static propTypes = {
    validators: shape({})
  };
  state = { ...defaultValidators, ...this.props.validators };
  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

export const ValidatorsConsumer = Consumer;

export const withValidators = TargetComponent => {
  const WithValidators = props => (
    <Consumer>
      {validators => <TargetComponent {...props} validators={validators} />}
    </Consumer>
  );
  const targetName = TargetComponent.displayName || TargetComponent.name;
  WithValidators.displayName = `withValidators(${targetName})`;
  return WithValidators;
};
