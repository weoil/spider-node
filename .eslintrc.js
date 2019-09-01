module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	extends: ['plugin:prettier/recommended'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	rules: {
		'prettier/prettier': [
			'error',
			{},
			{
				usePrettierrc: true,
			},
		],
	},
	settings: {
		'import/resolver': {
			webpack: {
				//此处config对应webpack.config.js的路径，我这个路径是vue-cli3默认的路径
				config: 'config/wp.base.config.js',
			},
		},
	},
};
