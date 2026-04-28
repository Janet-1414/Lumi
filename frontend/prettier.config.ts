// prettier.config.ts
import type { Config } from 'prettier'

const config: Config = {
  semi:           false,
  singleQuote:    true,
  tabWidth:       2,
  trailingComma:  'all',
  printWidth:     100,
  bracketSpacing: true,
  arrowParens:    'always',
  endOfLine:      'lf',
  plugins:        ['prettier-plugin-tailwindcss'],
}

export default config
