import isNumber from './isNumber';

const validator = isNumber({ message: 'fail' });

describe('isNumber validator', () => {
    it('accepts when value is a number', () => {
        expect(validator('-1')).toBe(null);
        expect(validator('1')).toBe(null);
        expect(validator('0')).toBe(null);
        expect(validator('1.000000001')).toBe(null);
        expect(validator('10e2')).toBe(null);
    });
    it('rejects when value is not a number', () => {
        expect(validator('not a number')).toBe('fail');
        expect(validator('NaN')).toBe('fail');
        expect(validator('12x21')).toBe('fail');
    });
});
