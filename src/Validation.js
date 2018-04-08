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

    getFieldValues = () => {
        const { config, fields, initialValues } = this.props;

        return Object.keys(config).reduce(
            (allFields, field) => ({
                ...allFields,
                [field]: fields[field] || initialValues[field] || '',
            }),
            {},
        );
    };

    componentDidMount() {
        this.props.register(this.props.config, this.getFieldValues());
    }
    componentWillUnmount() {
        this.props.unregister(this.props.config);
    }
    render() {
        const { errors, fields, submitted, children, config } = this.props;

        const childrenArgs = {
            errors,
            fields: this.getFieldValues(),
            submitted,
        };

        return children(childrenArgs);
    }
}

export default withFormContext(Validation);
