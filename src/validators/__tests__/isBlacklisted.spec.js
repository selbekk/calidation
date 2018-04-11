import isBlacklisted from '../isBlacklisted';

const message = 'fail';
describe('isBlacklisted validator', () => {
    it('accepts the empty string', () => {
        const blacklist = ['red', 'blue'];
        expect(isBlacklisted({ message, blacklist })('')).toBe(null);
    });

    it('accepts when value is not in blacklist', () => {
        const blacklist = ['green', 'yellow'];
        expect(isBlacklisted({ message, blacklist })('red')).toBe(null);
        expect(isBlacklisted({ message, blacklist })('blue')).toBe(null);
    });

    it('rejects when value is in blacklist', () => {
        const blacklist = ['red', 'blue'];
        expect(isBlacklisted({ message, blacklist })('red')).toBe(message);
        expect(isBlacklisted({ message, blacklist })('blue')).toBe(message);
    });

    it('rejects when blacklist contains non-string values', () => {
        const blacklist = [0, false];
        expect(isBlacklisted({ message, blacklist })('0')).toBe(message);
        expect(isBlacklisted({ message, blacklist })('false')).toBe(message);
        expect(isBlacklisted({ message, blacklist })('true')).toBe(null);
    });
});
