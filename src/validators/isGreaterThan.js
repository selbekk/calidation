export default config => value => {
    if (value === '') {
        return null;
    }
    return value <= config.value ? config.message : null;
};
