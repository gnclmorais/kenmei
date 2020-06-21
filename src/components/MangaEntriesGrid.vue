<template lang="pug">
  .relative.mt-12.grid.gap-5.sm_grid-cols-2.md_grid-cols-4.lg_grid-cols-6.lg_max-w-none
    .entry-card.relative.rounded-lg.shadow-lg.overflow-hidden(
      v-for="entry in entries"
    )
      .absolute.left-0.top-0.pl-2.pt-2(v-if="unread(entry)")
        base-badge(text="Unread")
        //- .rounded-full.h-2.w-2.flex.items-center.justify-center.bg-blue-400
        //- input#offers.form-checkbox.h-4.w-4.text-indigo-600.transition.duration-150.ease-in-out(type='checkbox')
      img.h-full.w-full.object-cover(
        :src='entry.attributes.cover_url'
        alt='cover'
      )
      .description.hidden.w-full.bottom-0(class='max-h-1/2')
        .w-full.h-42.bg-white.p-4.flex.flex-col.flex-1.justify-between
          .flex-1
            base-badge(:text="entryStatusName(entry)" :type="entryType(entry)")
            h3.mt-2.text-md.leading-7.font-semibold.text-gray-900(
              v-text="entry.attributes.title"
            )
          .mt-6.flex.items-center
</template>

<script>
  import { unread, sortBy } from '@/services/sorters';
  import { mapState } from 'vuex';

  export default {
    props: {
      entries: {
        type: Array,
        required: true,
      },
    },
    computed: {
      ...mapState('lists', [
        'statuses',
      ]),
    },
    methods: {
      unread,
      entryStatusName(e) {
        return this.statuses.find((s) => s.enum === e.attributes.status).name;
      },
      entryType(entry) {
        const { status } = entry.attributes;

        return {
          1: 'success', 2: 'warning', 3: 'warning-light', 5: 'danger',
        }[status];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .entry-card {
    height: 18rem;
  }
  .new-chapter-dot {
    background-color: #409EFF;
    @apply h-2 w-2 p-0 rounded-full;
  }
  .entry-card:hover > .description { display: block; position: absolute; }
</style>
