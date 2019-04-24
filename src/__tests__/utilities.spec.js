import { areDirty, getFirstDefinedValue, removeFrom } from '../utilities';

const foo = 'foo';
const bar = 'bar';
const original = {
    foo,
    bar,
};

describe('areDirty', () => {
    it('should compare objects', () => {
        expect(areDirty(original, {})).toEqual({
            foo: true,
            bar: true,
        });
        expect(areDirty(original, { foo, bar })).toEqual({
            foo: false,
            bar: false,
        });
        expect(areDirty(original, { foo, bar: 'BAR' })).toEqual({
            foo: false,
            bar: true,
        });
        expect(areDirty(original, { foo: null, bar: 'BAR' })).toEqual({
            foo: true,
            bar: true,
        });
        expect(
            areDirty(original, { foo: null, bar: 'BAR', wux: false }),
        ).toEqual({
            foo: true,
            bar: true,
            wux: true,
        });
    });
});

describe('getFirstDefinedValue', () => {
    it('should find and return first defined value', () => {
        expect(getFirstDefinedValue(undefined, null, foo)).toEqual(null);
        expect(getFirstDefinedValue(undefined, foo)).toEqual(foo);
        expect(getFirstDefinedValue(foo, bar)).toEqual(foo);
    });
});

describe('removeFrom', () => {
    it('should remove keys from object', () => {
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
});
