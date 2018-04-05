const EMAIL_REGEXP = /^\S+@\S+$/;

export default config => value => !EMAIL_REGEXP.test(value) 
    ? config.message 
    : null;
