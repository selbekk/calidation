import isGreaterThan from '../isGreaterThan';

const message = 'fail';

describe('isGreaterThan validator', () => {
    it('accepts the empty string', () => {
        expect(isGreaterThan({ message, value: 'arnold' })('')).toBe(null);
    });
    it('accepts when value is greater than config value', () => {
        expect(isGreaterThan({ message, value: 10 })('10.001')).toBe(null);
        expect(isGreaterThan({ message, value: 10 })('11')).toBe(null);
        expect(isGreaterThan({ message, value: -1000 })('-100')).toBe(null);
    });
    it('rejects when value is equal to config value', () => {
        expect(isGreaterThan({ message, value: -1 })('-1')).toBe(message);
        expect(isGreaterThan({ message, value: 0 })('0')).toBe(message);
        expect(isGreaterThan({ message, value: 1.123 })('1.123')).toBe(message);
    });
    it('rejects when value is less than config value', () => {
        expect(isGreaterThan({ message, value: 1.001 })('1')).toBe(message);
        expect(isGreaterThan({ message, value: 11 })('10')).toBe(message);
        expect(isGreaterThan({ message, value: -100 })('-1000')).toBe(message);
    });
});
