import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/app.ts',
  output: [
    {
      dir: 'dist',
      format: "commonjs",
      sourcemap: true
    }
  ],
  plugins: [
    json(),
    typescript(),
    nodeResolve(),
    commonjs(),
  ],
};
