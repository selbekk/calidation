import isEmail from './isEmail';

const validate = isEmail({ message: 'fail' });

describe('isEmail validator', () => {
    it('accepts valid email addresses', () => {
        const validEmails = [
            'test@test.com',
            'i-am-an@email.com',
            '123@456.789',
            'yolo@swag',
        ];

        validEmails.forEach(validEmail =>
            expect(validate(validEmail)).toBe(null),
        );
    });
    it('rejects invalid email addresses', () => {
        const invalidEmails = [
            'not an email',
            'notevenremotely',
            '@missing.com',
            'still@',
            '1234567890',
            '!)("#!(#/',
        ];

        invalidEmails.forEach(invalidEmail =>
            expect(validate(invalidEmail)).toBe('fail'),
        );
    });
});
