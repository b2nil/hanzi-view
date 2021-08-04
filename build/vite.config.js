const vite = require("vite")
const pkg = require("../package.json")
const shell = require('shelljs')
const path = require("path")
const vuePlugin = require('@vitejs/plugin-vue')

const resolveFile = (p) => path.resolve(__dirname, '..', p)
const peerDeps = Object.keys(pkg.peerDependencies)

/**
 * Transform `taro-env` or `taroEnv` prop
 */
const transformEnv = (platform = 'weapp') => {

  const findEnv = (source) => {
    const envReg = /(?<=(taro-env|taroEnv)=")([a-z0-9]+)(?=")/g
    const found = source.match(envReg)
    return found !== null ? found[0] : found
  }

  const isTaroEnv = (propName) => {
    return (propName === 'taro-env' || propName === 'taroEnv')
  }

  return (node, ctx) => {
    if (node.type >= 9 && node.type <= 11 /*if, if-branch, v-for*/) {
      const source = node.type === 11
        ? node.codegenNode.loc.source
        : node.loc.source
      const targetEnv = findEnv(source)
      if (targetEnv && targetEnv !== platform) ctx.removeNode(node)
    } else if (node.type === 1 /* Element */) {
      node.props.forEach((prop, index) => {
        if (prop.type === 6 && isTaroEnv(prop.name)) {
          platform !== prop.value.content
            ? ctx.removeNode(node)
            : node.props.splice(index, 1)
        }
      })
    }
  }
}

/** 
 * Miniapp tags should be prefixed with `taro-` 
 * and be resolved by `resolveComponent` in h5
 */
const transformH5Tags = (node) => {
  if (
    node.type === 1 /* NodeTypes.ELEMENT */ &&
    ['view', 'canvas'].includes(node.tag) /* is miniapp tag*/
  ) {
    node.tag = `taro-${node.tag}`
    node.tagType = 1 /* ElementTypes.COMPONENT */
  }
}

const genVuePluginOptions = (platform = 'weapp') => {
  let compilerOptions = {
    mode: "module",
    optimizeImports: true,
    comments: false,
  }

  if (platform !== 'h5') {
    compilerOptions = {
      ...compilerOptions,
      isNativeTag: (tag) => ['view', 'canvas'].includes(tag),
      nodeTransforms: [
        transformEnv('weapp')
      ]
    }
  } else {
    compilerOptions = {
      ...compilerOptions,
      nodeTransforms: [
        transformEnv('h5'),
        transformH5Tags,
      ]
    }
  }

  return {
    template: {
      ssr: false,
      compilerOptions
    }
  }
}

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
    vuePlugin(genVuePluginOptions('weapp'))
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
    vuePlugin(genVuePluginOptions('h5'))
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