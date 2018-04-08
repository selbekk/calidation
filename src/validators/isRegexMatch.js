export default config => value =>
    !config.regex.test(value) ? config.message : null;
