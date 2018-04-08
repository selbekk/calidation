export default config => value => {
    if (value === '') {
        return null;
    }
    let isValid;
    switch (typeof config.value) {
        case 'number': {
            isValid = Number(value) === config.value;
            break;
        }
        case 'boolean': {
            isValid = config.value ? value === 'true' : value === 'false';
            break;
        }
        case 'string':
        default: {
            isValid = String(value) === config.value;
        }
    }
    return isValid ? null : config.message;
};
