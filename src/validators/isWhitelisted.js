export default config => value => {
    if (value === '') {
        return null;
    }

    const stringWhitelist = config.whitelist.map(w => String(w));
    return !stringWhitelist.includes(value) ? config.message : null;
};
