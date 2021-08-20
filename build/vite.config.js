const vite = require("vite")
const pkg = require("../package.json")
const shell = require('shelljs')
const path = require("path")
const {
  vuePlugin,
  transformEnv
} = require('taro-plugin-vue')

const resolveFile = (p) => path.resolve(__dirname, '..', p)
const peerDeps = Object.keys(pkg.peerDependencies)

const baseUserConfig = {
  define: {
    'process.env.TARO_ENV': 'process.env.TARO_ENV'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  // ESBuildOptions extends ESbuild's own transform options.
  esbuild: {
    treeShaking: true,
  },
  // Build options
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolveFile(pkg.source),
      formats: ['es'],
    },
    rollupOptions: {
      external: [...peerDeps, './style.css'],
      treeshake: true
    },
    // See Rollup options docs for more details
    // Options to pass on to @rollup/plugin-commonjs
    commonjsOptions: {
      include: /\/node_modules\//
    },
    minify: false,
    brotliSize: false
  }
}

const miniappConfig = {
  ...baseUserConfig,
  plugins: [
    vuePlugin({
      template: {
        compilerOptions: {
          nodeTransforms: [transformEnv()]
        }
      }
    })
  ],
  build: {
    ...baseUserConfig.build,
    lib: {
      ...baseUserConfig.build.lib,
      fileName: "index"
    }
  }
}

const h5Config = {
  ...baseUserConfig,
  plugins: [
    vuePlugin({
      h5: true,
      template: {
        compilerOptions: {
          nodeTransforms: [transformEnv('h5')]
        }
      }
    })
  ],
  build: {
    ...baseUserConfig.build,
    lib: {
      ...baseUserConfig.build.lib,
      fileName: "index.h5"
    }
  }
}

async function copyTypes() {
  shell.cp('src/types.d.ts', 'dist/types.d.ts')
}

async function build() {
  await vite.build(miniappConfig)
  await vite.build(h5Config)
  await copyTypes()
}

build()