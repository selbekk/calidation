export default config => value => String(value) !== config.value 
    ? config.message 
    : null;
