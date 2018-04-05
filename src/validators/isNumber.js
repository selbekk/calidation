export default config => value => isNaN(value) ? config.message : null;
