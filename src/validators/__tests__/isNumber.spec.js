import isNumber from '../isNumber';

const validate = isNumber({ message: 'fail' });

describe('isNumber validator', () => {
    it('accepts the empty string', () => {
        expect(validate('')).toBe(null);
    });
    it('accepts when value is a number', () => {
        expect(validate('-1')).toBe(null);
        expect(validate('1')).toBe(null);
        expect(validate('0')).toBe(null);
        expect(validate('1.000000001')).toBe(null);
        expect(validate('10e2')).toBe(null);
    });
    it('rejects when value is not a number', () => {
        expect(validate('not a number')).toBe('fail');
        expect(validate('NaN')).toBe('fail');
        expect(validate('12x21')).toBe('fail');
    });
});
