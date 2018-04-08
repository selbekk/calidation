import isEmail from '../isEmail';

const message = 'message';
const validate = isEmail({ message });

describe('isEmail validator', () => {
    it('accepts the empty string', () => {
        expect(validate('')).toBe(null);
    });
    it('accepts valid email addresses', () => {
        expect(validate('test@test.com')).toBe(null);
        expect(validate('i-am-an@email.com')).toBe(null);
        expect(validate('123@456.789')).toBe(null);
        expect(validate('yolo@swag')).toBe(null);
    });
    it('rejects invalid email addresses', () => {
        expect(validate('not an email')).toBe(message);
        expect(validate('notevenremotely')).toBe(message);
        expect(validate('@missing.com')).toBe(message);
        expect(validate('still@')).toBe(message);
        expect(validate('1234567890')).toBe(message);
        expect(validate('(/!&"#(')).toBe(message);
    });
});
