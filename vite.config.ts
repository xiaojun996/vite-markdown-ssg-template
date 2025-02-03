import { resolve } from 'path'
import fs from 'fs'

import { defineConfig, type ConfigEnv } from 'vite'
import dotenv from 'dotenv' // Dotenv is a zero-dependency module that extracts the variables in the env variable from the '.env*' file
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Markdown from 'unplugin-vue-markdown/vite'
import WindiCSS from 'vite-plugin-windicss'

import Prism from 'markdown-it-prism'
import matter from 'gray-matter'
import viteCompression from 'vite-plugin-compression'

import type { UserConfigExport } from 'vite'

const baseConfig: UserConfigExport = {
  plugins: [
    Vue({ include: [/\.vue$/, /\.md$/] }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      pagesDir: './src/pages',
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1))
        const md = fs.readFileSync(path, 'utf-8')
        const { data } = matter(md)
        route.meta = Object.assign(route.meta || {}, { frontmatter: data })

        return route
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/unplugin/unplugin-vue-markdown
    Markdown({
      wrapperClasses: 'prose prose-sm m-auto text-left',
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Prism)
      },
    }),

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: 'prose prose-sm m-auto text-left',
    }),

    // https://github.com/anncwb/vite-plugin-compression/blob/main/README.zh_CN.md
    viteCompression(),
  ],
  resolve: {
    alias: [
      {
        find: '/@',
        replacement: resolve(__dirname, './src'),
      },
    ],
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  optimizeDeps: {
    include: [],
    exclude: [],
  },
}

export default ({ command, mode }: ConfigEnv) => {
  /**
   * Such as:
   * import.meta.env.MODE: {string}       The mode of the app runtime.
   * import.meta.env.BASE_URL: {string}   The base URL for deploying the app. This is determined by the base configuration entry.
   * import.meta.env.PROD: {boolean}      Whether the app is runtime in the production environment.
   * import.meta.env.DEV: {boolean}       Whether app runtime is in the development environment (always the opposite of import.meta.env.PROD).
   */
  const { VITE_APP_ENV, VITE_APP_PROXY_URL, VITE_APP_BASE_URL } = dotenv.parse(fs.readFileSync(`.env.${mode}`))

  setTimeout(() => {
    console.log()
    console.log('\x1b[36m%s\x1b[0m', `🏠--APP环境(VITE_APP_ENV): ${VITE_APP_ENV}`)
    console.log('\x1b[36m%s\x1b[0m', `😈--APP代理URL(VITE_APP_PROXY_URL): ${VITE_APP_PROXY_URL}`)
    console.log('\x1b[36m%s\x1b[0m', `🔗--APP基础URL(VITE_APP_BASE_URL): ${VITE_APP_BASE_URL}`)
    console.log()
  }, 66)

  if (command === 'serve') {
    return defineConfig({ ...baseConfig })
  } else {
    return defineConfig({ ...baseConfig })
  }
}
