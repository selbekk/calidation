const EMAIL_REGEXP = /^\S+@\S+$/;

export default config => value => {
    if (value === '') {
        return null;
    }
    return !EMAIL_REGEXP.test(value) ? config.message : null;
};
