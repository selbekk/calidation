import isRegexMatch from './isRegexMatch';

const message = 'fail';

describe('isRegexMatch validator', () => {
    it('accepts the empty string', () => {
        expect(isRegexMatch({ message, regex: /^\d{4}$/ })('')).toBe(null);
    });
    it('accepts when the regex matches', () => {
        expect(isRegexMatch({ message, regex: /^\d{4}$/ })('1234')).toBe(null);
        expect(isRegexMatch({ message, regex: /^\d{4}$/ })('4321')).toBe(null);
    });
    it('rejects when the regex does not match', () => {
        expect(isRegexMatch({ message, regex: /^\d{4}$/ })('12345')).toBe(
            message,
        );
        expect(isRegexMatch({ message, regex: /^\d{4}$/ })('not a match')).toBe(
            message,
        );
    });
});
