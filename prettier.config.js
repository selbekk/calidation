module.exports = {
    arrowParens: 'avoid',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    printWidth: 80,
    semi: true,
    singleQuote: true,
    useTabs: false,
    tabWidth: 4,
    trailingComma: 'all',
    overrides: [
        {
            files: '*.md',
            options: { parser: 'markdown' },
        },
        {
            files: '*.less',
            options: { parser: 'postcss' },
        },
    ],
};
