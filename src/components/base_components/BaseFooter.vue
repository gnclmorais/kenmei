<template lang="pug">
  footer(
    :class="{ 'bg-gray-800': dark, 'bg-white border-t border-gray-200': !dark }"
  )
    .max-w-screen-xl.mx-auto.py-12.px-4.sm_px-6.lg_px-8
      .xl_grid.xl_grid-cols-3.xl_gap-8
        .grid.grid-cols-2.gap-8.xl_col-span-2
          .md_grid.md_grid-cols-2.md_gap-8
            div(
              v-for='(group, name, index) in linkGroupOne'
              :class="{'mt-12 md_mt-0': index !== 0}"
            )
              h4(v-text="group.heading")
              ul.mt-4
                li(
                  v-for='(link, name, index) in group.links'
                  :class="{'mt-4': index !== 0}"
                )
                  router-link(
                    :to="link.href"
                    :class="{ 'link': dark, 'link-light': !dark }"
                    v-text="link.heading"
                  )
          .md_grid.md_grid-cols-2.md_gap-8
            div(
              v-for='(group, name, index) in linkGroupTwo'
              :class="{'mt-12 md_mt-0': index !== 0}"
            )
              h4(v-text="group.heading")
              ul.mt-4
                li(
                  v-for='(link, name, index) in group.links'
                  :class="{'mt-4': index !== 0}"
                )
                  router-link(
                    :to="link.href"
                    :class="{ 'link': dark, 'link-light': !dark }"
                    v-text="link.heading"
                  )
        .mt-8.xl_mt-0
          h4(v-text="subscribe.heading")
          p.mt-4.text-base.leading-6(
            v-text="subscribe.paragraph"
            :class="{ 'text-gray-300': dark, 'text-gray-500': !dark }"
          )
          form.mt-4.sm_flex.sm_max-w-md(
            action='https://tinyletter.com/kenmei'
            method='post'
            target='popupwindow'
            v-on:submit="openNewsletterWindow"
          )
            input.placeholder-gray-500.focus_placeholder-gray-400(
              :class="{ 'border-transparent': dark, 'border-gray-300': !dark }"
              aria-label='Email address'
              name='email'
              type='email'
              placeholder='Enter your email'
              required
            )
            input(type='hidden', value='1', name='embed')
            .mt-3.rounded-md.shadow.sm_mt-0.sm_ml-3.sm_flex-shrink-0
              button(type="submit" v-text="subscribe.buttonText")
      .socials-with-copyright(
        :class="{ 'border-gray-700': dark, 'border-gray-200': !dark }"
      )
        .flex.md_order-2
          a.text-gray-400.hover_text-gray-300(
            v-for='(social, name, index) in socials'
            target="_blank"
            rel="noreferrer"
            :href='social.href'
            :class="{'ml-6': index !== 0}"
          )
            span.sr-only(v-text="social.heading")
            component.h-6.w-6.fill-current(:is="social.icon")
        p.mt-8.text-base.leading-6.text-gray-400.md_mt-0.md_order-1
          | &copy; {{ copyrightYear }} {{ companyName }}. All rights reserved.
</template>

<script>
  export default {
    props: {
      dark: {
        type: Boolean,
        default: false,
      },
      companyName: { type: String, default: 'Studio Shogun, LTD' },
      copyrightYear: { type: String, default: '2020' },
      subscribe: {
        type: Object,
        default: () => ({
          heading: 'Subscribe to our newsletter',
          paragraph: 'The latest development updates, and general news, sent to your inbox regularly.',
          buttonText: 'Subscribe',
        }),
      },
      socials: {
        type: Object,
        default: () => ({
          discord: {
            heading: 'Discord',
            href: 'https://discord.gg/XeTFtYW',
            icon: 'icon-discord',
          },
          twitter: {
            heading: 'Twitter',
            href: 'https://twitter.com/KenmeiApp',
            icon: 'icon-twitter',
          },
          github: {
            heading: 'Github',
            href: 'https://github.com/doutatsu/kenmei',
            icon: 'icon-github',
          },
          kofi: {
            heading: 'Ko-fi',
            href: 'https://ko-fi.com/kenmei',
            icon: 'icon-kofi',
          },
        }),
      },
      linkGroupOne: {
        type: Object,
        default: () => ({
          company: {
            heading: 'Product',
            links: {
              about: { heading: 'About', href: '/about' },
              blog: { heading: 'Blog', href: '/blog' },
            },
          },
          support: {
            heading: 'Resources',
            links: {
              changelog: { heading: 'Changelog', href: '/changelog' },
              sources: { heading: 'Supported Sites', href: '/supported-sites' },
            },
          },
        }),
      },
      linkGroupTwo: {
        type: Object,
        default: () => ({
          legal: {
            heading: 'Legal',
            links: {
              privacy: { heading: 'Privacy', href: '/privacy' },
              terms: { heading: 'Terms', href: '/terms' },
            },
          },
        }),
      },
    },
    methods: {
      openNewsletterWindow() {
        window.open(
          'https://tinyletter.com/kenmei',
          'popupwindow',
          'scrollbars=yes,width=800,height=600'
        );

        return true;
      },
    },
  };
</script>

<style lang="scss" media="screen" scoped>
  .socials-with-copyright {
    @apply mt-8 border-t pt-8;

    @screen md {
      @apply flex items-center justify-between;
    }
  }

  button {
    @apply w-full flex items-center justify-center px-5 py-3 border;
    @apply border-transparent text-base leading-6 font-medium rounded-md;
    @apply text-white bg-blue-500 transition duration-150 ease-in-out;

    &:hover {
      @apply bg-blue-400;
    }

    &:focus {
      @apply outline-none bg-blue-400;
    }
  }

  h4 {
    @apply text-sm leading-5 font-semibold;
    @apply tracking-wider text-gray-400 uppercase;
  }

  input {
    @apply appearance-none w-full px-5 py-3 border text-base;
    @apply leading-6 rounded-md text-gray-900 bg-white;
    @apply transition duration-150 ease-in-out;

    &:focus {
      @apply outline-none;
    }
  }

  .link {
    @apply text-base leading-6 text-gray-300;

    &:hover {
      @apply text-white;
    }
  }

  .link-light {
    @apply text-base leading-6 text-gray-500;

    &:hover {
      @apply text-gray-900;
    }
  }
</style>
