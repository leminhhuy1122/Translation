export default [
    {
        files: ['src/**/*.js', '*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module'
        },
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'prefer-const': 'error',
            'no-var': 'error'
        }
    }
];