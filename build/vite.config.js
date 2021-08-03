const vite = require("vite")
const pkg = require("../package.json")
const shell = require('shelljs')
const path = require("path")

const resolveFile = (p) => path.resolve(__dirname, '..', p)
const peerDeps = Object.keys(pkg.peerDependencies)

const baseUserConfig = {
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
  define: {
    'process.env.TARO_ENV': 'process.env.TARO_ENV'
  },
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

async function copyStyle() {
  shell.cp('src/index.css', 'dist/index.css')
}

async function renameFileNames() {
  shell.mv('dist/index.es.js', pkg.module)
  shell.mv('dist/index.es.js.map', pkg.module + '.map')
  shell.mv('dist/index.h5.es.js', pkg["main:h5"])
  shell.mv('dist/index.h5.es.js.map', pkg["main:h5"] + '.map')
}

async function build() {
  await vite.build(miniappConfig)
  process.env.TARO_ENV = 'h5'
  await vite.build(h5Config)
  // await copyStyle()
  await copyTypes()
  // await renameFileNames()
}

build()