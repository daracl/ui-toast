import { defineConfig } from 'vite';
import path from 'path';
import banner from 'vite-plugin-banner';
import packageJson from './package.json';
import { visualizer } from "rollup-plugin-visualizer";

const topBanner = `/*!
* ${packageJson.name}  v${packageJson.version}
* Copyright 2023-${new Date().getUTCFullYear()} darainfo and other contributors; 
* Licensed ${packageJson.license}
*/`;

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const moduleName = 'daracl.toast';

  return {
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
        '@t': path.resolve(__dirname, 'src/types'),
      },
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
    },
    build: {
      outDir: isProd ? 'dist' : 'dist/unmin',
      emptyOutDir: true,
      sourcemap: true,
      minify: isProd ? 'esbuild' : false,
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'Daracl',
        //formats: ['es', 'cjs', 'umd'],
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => {
          if (format === 'umd') {
            return isProd ? `${moduleName}.min.umd.js` : `${moduleName}.umd.js`;
          }

          if (format === 'es') {
            return isProd ? `index.min.js` : `index.js`;  
          }

          if (format === 'cjs') {
            return isProd ? `index.min.cjs` : `index.cjs`;  
          }

          // es / cjs
          return isProd ? `index.min.${format}.js` : `index.${format}.js`;
        },
      },
      rollupOptions: {
        treeshake: {
           moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        },
        external: [
          "@daracl/core"
        ],
       // plugins: isProd ? [terser()] : [], 
        output: {
          extend: true,
          assetFileNames: (assetInfo) => {
            if ((assetInfo.name||'').endsWith('.css')) {
              return isProd ? `${moduleName}.min.[ext]` : `${moduleName}.[ext]`;
            }
            return 'assets/[name].[ext]';
          },
          globals: {
            "@daracl/core": "Daracl"
          }
        },
        plugins: [
          visualizer({
            filename: "bundle-report.html",
            open: true,      // 자동으로 브라우저에서 보고서 열기
            gzipSize: true,
            brotliSize: true
          })
        ]
      },
    },
    plugins: [banner(topBanner)],
    define: {
      APP_VERSION: JSON.stringify(packageJson.version),
    },
    server: {
      host: '0.0.0.0',
      port: 4175,
      open: "/uitest/index.html",
      watch: {
        ignored: ['!**/src/**'],
      },
    },
  };
});
