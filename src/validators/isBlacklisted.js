export default config => value => {
    if (value === '') {
        return null;
    }

    const stringBlacklist = config.blacklist.map(w => String(w));
    return stringBlacklist.includes(value) ? config.message : null;
};
