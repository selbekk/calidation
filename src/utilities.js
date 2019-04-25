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
