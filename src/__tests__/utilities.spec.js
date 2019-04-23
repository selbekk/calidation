import { getFirstDefinedValue, removeFrom } from '../utilities';

const foo = 'foo';
const bar = 'bar';

describe('getFirstDefinedValue', () => {
    it('should find and return first defined value', () => {
        expect(getFirstDefinedValue(undefined, null, foo)).toEqual(null);
        expect(getFirstDefinedValue(undefined, foo)).toEqual(foo);
        expect(getFirstDefinedValue(foo, bar)).toEqual(foo);
    });
});

describe('removeFrom', () => {
    const original = {
        foo,
        bar,
    };

    expect(removeFrom(original)).toEqual(expect.any(Function));

    const removeKeys = removeFrom(original);

    expect(removeKeys([])).toEqual(original);
    expect(removeKeys([foo])).toEqual({
        bar,
    });
    expect(removeKeys([foo, bar])).toEqual({});
    expect(removeKeys(['wux'])).toEqual(original);
    expect(removeKeys([foo, bar, 'wux'])).toEqual({});
});
