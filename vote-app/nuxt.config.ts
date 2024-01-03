// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss', 
    '@bg-dev/nuxt-naiveui',
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    public: {
      environment: process.env.NUXT_NODE_ENV,
    }
  },
  build: {
    transpile:
      process.env.NODE_ENV === 'production'
        ? [
            'naive-ui',
            'vueuc',
            '@css-render/vue3-ssr',
            '@juggle/resize-observer'
          ]
        : ['@juggle/resize-observer']
  },
  vite: {
    base: './',
    optimizeDeps: {
      include:
        process.env.NODE_ENV === 'development'
          ? ['naive-ui', 'vueuc', 'date-fns-tz/formatInTimeZone']
          : []
    }
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Contests | DDAM',
      meta: [
        { name: 'robots', content: 'noindex' },
        { name: 'googlebot', content: 'noindex' }
      ],
      script: [
        {
          children:
            'window.process = window.process || { env: { NODE_DEBUG: undefined, DEBUG: undefined } }; window.global = window;'
        }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: [
    // '@/assets/css/amplify.scss'
  ]
})
