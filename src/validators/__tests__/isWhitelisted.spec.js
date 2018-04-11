import isWhitelisted from '../isWhitelisted';

const message = 'fail';
describe('isWhitelisted validator', () => {
    it('accepts the empty string', () => {
        const whitelist = ['red', 'blue'];
        expect(isWhitelisted({ message, whitelist })('')).toBe(null);
    });

    it('accepts when value is in whitelist', () => {
        const whitelist = ['red', 'blue'];
        expect(isWhitelisted({ message, whitelist })('red')).toBe(null);
        expect(isWhitelisted({ message, whitelist })('blue')).toBe(null);
    });

    it('accepts when whitelist contains non-string values', () => {
        const whitelist = [0, false];
        expect(isWhitelisted({ message, whitelist })('0')).toBe(null);
        expect(isWhitelisted({ message, whitelist })('false')).toBe(null);
        expect(isWhitelisted({ message, whitelist })('true')).toBe(message);
    });

    it("rejects when value isn't in whitelist", () => {
        const whitelist = ['green', 'yellow'];
        expect(isWhitelisted({ message, whitelist })('red')).toBe(message);
        expect(isWhitelisted({ message, whitelist })('blue')).toBe(message);
    });
});
