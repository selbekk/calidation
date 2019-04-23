export const areDirty = (original, current) => {
    const keys = [
        ...new Set([...Object.keys(original), ...Object.keys(current)]),
    ];

    return keys.reduce(
        (obj, key) => ({
            ...obj,
            [key]: original[key] !== current[key],
        }),
        {},
    );
};

export const getFirstDefinedValue = (...values) =>
    values.find(value => value !== undefined);

export const removeFrom = original => keysToRemove =>
    Object.entries(original).reduce(
        (obj, [key, value]) => ({
            ...obj,
            ...(!keysToRemove.includes(key)
                ? {
                      [key]: value,
                  }
                : {}),
        }),
        {},
    );
