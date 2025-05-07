import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'index.ts',
  external: [ 'lodash' ],
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: false
    }
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    terser({ maxWorkers: 4 })
  ]
}