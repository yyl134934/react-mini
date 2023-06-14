const OFF = 0; // 定义 OFF 常量，值为 0
const WARN = 1; // 定义 WARN 常量，值为 1
const ERROR = 2; // 定义 ERROR 常量，值为 2

module.exports = {
  // 配置 ESLint 的环境
  env: {
    browser: true, // 浏览器环境，表示可以使用全局变量，如 window、document 等
    es2023: true, // 支持 ES2023 语法
  },

  // 配置 ESLint 的扩展
  extends: [
    'airbnb', // 使用 airbnb 的规则
    'airbnb/hooks', // 使用 airbnb 配置针对 React Hooks 的规则
    'plugin:react/recommended', // 使用 react 推荐的规则
    'plugin:unicorn/recommended', // 使用 unicorn 推荐的规则
    'plugin:promise/recommended', // 使用 promise 推荐的规则
    'plugin:prettier/recommended', // 使用 prettier 推荐的规则
    'plugin:@typescript-eslint/recommended', // 使用 @typescript-eslint 推荐的规则
  ],

  // 指定解析器
  parser: '@typescript-eslint/parser',

  // 配置解析器选项
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // 支持 JSX 语法
    },
    ecmaVersion: 14, // 支持 ES2023
    sourceType: 'module', // 代码是 ECMAScript 模块
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
      },
      typescript: {},
    },
  },

  // 配置插件
  plugins: ['react', 'unicorn', 'promise', '@typescript-eslint', 'prettier'],

  // 配置规则
  rules: {
    'import/extensions': [
      ERROR,
      'ignorePackages',
      {
        tsx: 'never', // TypeScript React 不需要扩展名
        ts: 'never', // TypeScript 不需要扩展名
        js: 'never', // JavaScript 不需要扩展名
      },
    ],
    'import/no-extraneous-dependencies': [ERROR, { devDependencies: true }], // 不允许导入开发环境的依赖
    'import/prefer-default-export': OFF, // 不要求导出默认导出，可以使用命名导出
    'import/no-unresolved': ERROR, // 禁止导入未解析的模块
    'import/no-dynamic-require': OFF, // 允许使用 require

    'unicorn/better-regex': ERROR, // 正则表达式必须合法，不能出现 RegExp 构造函数
    'unicorn/prevent-abbreviations': OFF, // 允许使用缩写
    'unicorn/filename-case': [
      ERROR,
      {
        cases: {
          // 文件名格式
          kebabCase: true, // 中划线命名法
          camelCase: true, // 小驼峰命名法
          snakeCase: false, // 下划线命名法
          pascalCase: true, // 大驼峰命名法
        },
      },
    ],
    'unicorn/no-array-instanceof': WARN, // 禁止使用 Array 构造函数
    'unicorn/no-for-loop': WARN, // 禁止使用 for 循环
    'unicorn/prefer-add-event-listener': [
      ERROR,
      {
        excludedPackages: ['koa', 'sax'], // 排除的包
      },
    ],
    'unicorn/prefer-query-selector': ERROR, // 建议使用 querySelector
    'unicorn/no-null': OFF, // 允许使用 null
    'unicorn/no-array-reduce': OFF, // 允许使用数组的 reduce 方法

    '@typescript-eslint/no-useless-constructor': ERROR, // 禁止使用无用的构造函数
    '@typescript-eslint/no-empty-function': WARN, // 不允许空函数
    '@typescript-eslint/no-var-requires': OFF, // 允许使用 require
    '@typescript-eslint/explicit-function-return-type': OFF, // 不要求函数的返回值类型必须明确
    '@typescript-eslint/explicit-module-boundary-types': OFF, // 不要求导出的函数和方法的参数和返回值类型必须明确
    '@typescript-eslint/no-explicit-any': OFF, // 允许使用 any 类型
    '@typescript-eslint/no-use-before-define': ERROR, // 禁止在变量声明之前使用变量
    '@typescript-eslint/no-unused-vars': WARN, // 不允许出现未使用的变量
    'no-unused-vars': OFF, // 允许未使用的变量

    // 配置以下 React 相关的规则
    'react/jsx-filename-extension': [ERROR, { extensions: ['.tsx', 'ts', '.jsx', 'js'] }], // 允许导入 React 组件的文件扩展名
    'react/jsx-indent-props': [ERROR, 2], // props 缩进使用 2 个空格
    'react/jsx-indent': [ERROR, 2], // JSX 元素缩进使用 2 个空格
    'react/jsx-one-expression-per-line': OFF, // 允许在 JSX 中一行显示多个表达式
    'react/destructuring-assignment': OFF, // 允许不使用解构赋值
    'react/state-in-constructor': OFF, // 允许在构造函数中不初始化 state
    'react/jsx-props-no-spreading': OFF, // 允许使用展开符传递所有属性
    'react/prop-types': OFF, // 不要求使用 propTypes 进行类型检查

    // 配置以下关于 Accessibility 的规则
    'jsx-a11y/click-events-have-key-events': OFF, // 不要求 click 事件同时带有键盘事件
    'jsx-a11y/no-noninteractive-element-interactions': OFF, // 允许非交互式元素上的交互事件
    'jsx-a11y/no-static-element-interactions': OFF, // 允许静态元素上的交互事件

    // 配置以下关于 Bariables 的规则
    'no-unused-expressions': WARN, // 允许出现未使用的表达式
    'no-plusplus': OFF, // 允许出现 ++/-- 运算符
    'no-console': OFF, // 允许使用 console 方法
    'class-methods-use-this': ERROR, // 要求在 class 中使用 this
    'global-require': OFF, // 允许 require 在函数体内使用
    'no-use-before-define': OFF, // 允许在变量声明之前使用变量

    // 配置以下关于语法风格的规则
    'lines-between-class-members': [ERROR, 'always'], // class 成员之间要求使用空行分隔
    'linebreak-style': [ERROR, 'unix'], // 换行符使用 Unix 格式
    quotes: [ERROR, 'single'], // 使用单引号
    semi: [ERROR, 'always'], // 强制使用分号
    'jsx-quotes': [ERROR, 'prefer-single'], // JSX 属性值使用单引号
    'no-restricted-syntax': OFF, // 允许使用不受限制的语法结构
    'no-continue': OFF, // 允许使用 continue 语句
  },
};
