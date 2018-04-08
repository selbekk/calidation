export default config => value => {
    if (value === '') {
        return null;
    }
    return isNaN(value) ? config.message : null;
};
