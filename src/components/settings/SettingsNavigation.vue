<template lang="pug">
  #settings
    nav.hidden.sm_block
      a.desktop-link.group(
        href='#'
        v-for='(link, index) in sections'
        :key="index"
        :class="linkClasses(link, index)"
        @click.prevent="$emit('pageChanged', link.title)"
      )
        svg.desktop-svg.group-hover_text-gray-500.stroke-current(
          fill='none'
          viewbox='0 0 24 24'
        )
          path(
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            :d='link.icon'
          )
        span.truncate(v-text="link.title")
    .sm_hidden.mb-4
      .border-b.border-gray-200
        nav.flex.-mb-px.justify-around
          a.group.mobile-link(
            href='#'
            v-for='(link, index) in sections'
            :key="index"
            :class="{ 'mobile-link--active': link.title === currentPage }"
            @click.prevent="$emit('pageChanged', link.title)"
          )
            svg.mr-2.h-6.w-6.stroke-current(
              :class="{ 'text-blue-500': link.title === currentPage }"
              class='-ml-0.5',
              fill='none'
              viewbox='0 0 24 24'
            )
              path(
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                :d='link.icon'
              )
            span(v-text="link.title")
</template>

<script>
  export default {
    props: {
      currentPage: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        sections: [
          {
            title: 'Account',
            icon: `
              M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0
              00-7-7z
            `,
          },
          {
            title: 'Manga List',
            icon: `
              M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3
              6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5
              1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5
              1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5
              1.253
            `,
          },
        ],
      };
    },
    methods: {
      linkClasses(link, index) {
        return {
          'mt-1': index !== 0,
          regular: link.title !== this.currentPage,
          active: link.title === this.currentPage,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  a, svg {
    @apply transition ease-in-out duration-150;
  }

  a {
    @apply items-center text-sm font-medium leading-5;
  }

  .desktop-link {
    @apply flex px-3 py-2 rounded-md;
  }

  .desktop-svg {
    @apply flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-500;
  }

  .regular {
    @apply text-gray-600;

    &:hover {
      @apply text-gray-900 bg-gray-100;
    }
  }

  .active {
    @apply text-gray-900 bg-gray-200;

    &:hover {
      @apply text-gray-900;
    }
  }

  .mobile-link {
    @apply inline-flex py-4 px-1 border-b-2 border-transparent;
    @apply text-gray-500;
  }

  .mobile-link--active {
    @apply text-blue-600 border-blue-500;
  }
</style>
