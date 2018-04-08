import isEqual from './isEqual';

const message = 'fail';

describe('isEqual validator', () => {
    it('accepts equal strings', () => {
        expect(isEqual({ message, value: 'arnold' })('arnold')).toBe(null);
        expect(isEqual({ message, value: '' })('')).toBe(null);
        expect(
            isEqual({ message, value: 'string with whitespace' })(
                'string with whitespace',
            ),
        ).toBe(null);
    });

    it('accepts equal numbers', () => {
        expect(isEqual({ message, value: '123' })('123')).toBe(null);
        expect(isEqual({ message, value: '0' })('0')).toBe(null);
        expect(isEqual({ message, value: '-123' })('-123')).toBe(null);
        expect(isEqual({ message, value: 123 })('123')).toBe(null);
        expect(isEqual({ message, value: 0 })('0')).toBe(null);
        expect(isEqual({ message, value: -123 })('-123')).toBe(null);
    });

    it('accepts equal booleans', () => {
        expect(isEqual({ message, value: 'true' })('true')).toBe(null);
        expect(isEqual({ message, value: true })('true')).toBe(null);
        expect(isEqual({ message, value: 'false' })('false')).toBe(null);
        expect(isEqual({ message, value: false })('false')).toBe(null);
    });

    it('rejects when value is not equal', () => {
        expect(isEqual({ message, value: 'hi' })('ho')).toBe(message);
        expect(isEqual({ message, value: '  ' })('')).toBe(message);
        expect(isEqual({ message, value: '123' })('321')).toBe(message);
        expect(isEqual({ message, value: 123 })('321')).toBe(message);
        expect(isEqual({ message, value: false })('true')).toBe(message);
    });
});
