export default config => value => {
    if (value === '') {
        return null;
    }
    return !config.regex.test(value) ? config.message : null;
};
