<template lang="pug">
  .max-w-7xl.px-8.my-10.mx-auto
    .grid.gap-10.grid-cols-1.sm_grid-cols-3.md_grid-cols-4.lg_grid-cols-6
      a.no-underline.max-w-sm.rounded-lg.overflow-hidden.shadow.bg-white.hover_shadow-lg.transition.duration-200(
        v-for='source in sources'
        :href='source.url'
        target="_blank"
        rel="noreferrer"
      )
        .relative(class='pb-2/5')
          img.absolute.h-full.w-full.object-cover(
            v-if="source.logo"
            :src='require(`@/assets/source_logos/${source.logo}`)'
            :alt='source.name'
          )
        .p-3
          h4.mt-1.font-semibold.text-xl.sm_text-base.leading-tight.text-gray-800(
            v-text="source.name"
          )
        .p-3
          span.inline-block.text-sm.sm_text-xs.px-2.py-1.rounded-full.uppercase.font-semibold.tracking-wide(
            :class="sourceStatusColour(source.status)"
            v-text="source.status"
          )
</template>

<script>
  import VueScrollTo from 'vue-scrollto';

  import sources from '@/assets/sources.json';

  export default {
    metaInfo: {
      title: 'Supported manga sites | Kenmei',
    },
    data() {
      return {
        sources,
      };
    },
    mounted() {
      VueScrollTo.scrollTo('#home');
    },
    methods: {
      sourceStatusColour(status) {
        switch (status) {
        case 'Supported':
          return 'bg-green-200 text-green-800';
        case 'In Development':
          return 'bg-yellow-200 text-yellow-800';
        case 'Down':
          return 'bg-red-200 text-red-800';
        default:
          return 'bg-gray-200 text-gray-800';
        }
      },
    },
  };
</script>
