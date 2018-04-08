import isRequired from '../isRequired';

const message = 'fail';
const validator = isRequired({ message });

describe('isRequired', () => {
    it('accepts when value is not empty', () => {
        expect(validator('a value')).toBe(null);
        expect(validator(' ')).toBe(null);
        expect(validator('0')).toBe(null);
    });

    it('rejects when value is empty', () => {
        expect(validator('')).toBe(message);
    });
});
