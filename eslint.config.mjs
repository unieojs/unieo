import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      '@typescript-eslint/unbound-method': 'off', // 允许使用类方法
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      
      // ✨ 使用 @stylistic 插件的格式化规则
      // 数组括号内空格
      '@stylistic/array-bracket-spacing': ['error', 'always'], // [ 1, 2, 3 ]
      // 对象大括号内空格  
      '@stylistic/object-curly-spacing': ['error', 'always'], // { a: 1, b: 2 }
      // 函数调用括号内空格
      '@stylistic/space-in-parens': ['error', 'never'], // func(arg) 不是 func( arg )
      // 箭头函数参数括号
      '@stylistic/arrow-parens': ['error', 'as-needed'], // x => x (单参数不需要括号)
      // 分号
      '@stylistic/semi': ['error', 'always'],
      // 引号
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      // 尾随逗号
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      // 缩进
      '@stylistic/indent': ['error', 2],
      // 行尾
      '@stylistic/eol-last': ['error', 'always'],
      // 尾随空格
      '@stylistic/no-trailing-spaces': 'error',
      // 最大行长度
      '@stylistic/max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      // 大括号内空格 (for if/for/while etc.)
      '@stylistic/block-spacing': ['error', 'always'],
      // 大括号样式
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      // 操作符周围空格
      '@stylistic/space-infix-ops': 'error',
      // 关键字空格
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.js', '*.mjs'],
  },
);
