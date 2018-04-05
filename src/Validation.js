import React, { Component } from 'react';
import { bool, func, shape } from 'prop-types';
import { withFormContext } from './FormContext';

class Validation extends Component {
    static defaultProps = {
        errors: {},
        fields: {},
        initialValues: {},
    };

    static propTypes = {
        config: shape({}).isRequired,
        errors: shape({}),
        fields: shape({}),
        register: func,
        submitted: bool,
        unregister: func,
    };

    getInitialFieldValues = () =>
        Object.keys(this.props.config).reduce(
            (fields, field) => ({
                ...fields,
                [field]: this.props.initialValues[field] || '',
            }),
            {},
        );

    componentDidMount() {
        this.props.register(this.props.config, this.getInitialFieldValues());
    }
    componentWillUnmount() {
        this.props.unregister(this.props.config);
    }
    render() {
        const { errors, fields, submitted, children } = this.props;

        const childrenArgs = {
            errors,
            fields,
            submitted,
        };
        return children(childrenArgs);
    }
}

export default withFormContext(Validation);
