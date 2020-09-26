<template lang="pug">
  .min-w-0.flex-1.flex.items-center.select-none
    .min-w-0.flex-1.px-4.md_grid.md_grid-cols-3.md_gap-4
      div
        .text-sm.leading-5.text-gray-700.sm_truncate.hover_text-blue-600(ref="titleLink")
          a(
            :href="item.links.series_url"
            :content="sanitizeTitle(item.attributes.title)"
            target="_blank"
            v-tippy="{ placement : 'top-start', onShow: () => tippyEnabled, interactive : true }"
          )
            | {{ sanitizeTitle(item.attributes.title) }}
        base-badge.mt-2(:type="entryType(item)")
          | {{ entryStatusName(item) }}
        .block.sm_hidden.space-x-1.mt-2
          chapter(
            v-if="item.attributes.last_chapter_read"
            :chapter="lastChapterRead"
            :volume="lastVolumeRead"
            :url="item.links.last_chapter_read_url"
          )
          chapter(
            v-if="item.attributes.last_chapter_available"
            :chapter="lastChapterAvailable"
            :volume="lastVolumeAvailable"
            :url="item.links.last_chapter_available_url"
          )
      div.mt-2.hidden.sm_mt-0.sm_block
        .text-sm.leading-5.text-gray-900.flex.items-center
          template(v-if="item.attributes.last_chapter_read")
            | Last Read:
            chapter.ml-1(
              :chapter="lastChapterRead"
              :volume="lastVolumeRead"
              :url="item.links.last_chapter_read_url"
            )
          span(v-else)
            | No chapters read
        .mt-2.flex.items-center.text-sm.leading-5.text-gray-500
          icon-calendar.flex-shrink-0.h-5.w-5.text-gray-400(class='mr-1.5')
          span
            time(
              v-if="item.attributes.last_released_at"
              :title='formatTime(item.attributes.last_released_at)'
              :datetime='item.attributes.last_released_at'
            )
              | Read {{ item.attributes.last_released_at | timeAgo }}
            template(v-else)
              | Unknown
      div.mt-2.hidden.sm_mt-0.sm_block
        .text-sm.leading-5.text-gray-900.flex.items-center
          template(v-if="item.attributes.last_chapter_available")
            | Last Available:
            chapter.ml-1(
              :chapter="lastChapterAvailable"
              :volume="lastVolumeAvailable"
              :url="item.links.last_chapter_available_url"
            )
          span(v-else)
            | No Chapters Available
        .mt-2.flex.items-center.text-sm.leading-5.text-gray-500
          icon-calendar.flex-shrink-0.h-5.w-5.text-gray-400(class='mr-1.5')
          span
            time(
              v-if="item.attributes.last_released_at"
              :title='formatTime(item.attributes.last_released_at)'
              :datetime='item.attributes.last_released_at'
            )
              | Released {{ item.attributes.last_released_at | timeAgo }}
            template(v-else)
              | Unknown
</template>

<script>
  import { mapState } from 'vuex';
  import he from 'he';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import localizedFormat from 'dayjs/plugin/localizedFormat';

  import Chapter from './TheMangaListRowBodyChapter.vue';

  dayjs.extend(relativeTime);
  dayjs.extend(localizedFormat);

  export default {
    components: {
      Chapter,
    },
    filters: {
      timeAgo(datetime) {
        return dayjs().to(dayjs(datetime));
      },
    },
    props: {
      item: {
        type: Object,
        required: true,
      },
    },
    computed: {
      ...mapState('lists', [
        'statuses',
      ]),
      lastVolumeRead() {
        return this.item.attributes.last_volume_read;
      },
      lastChapterRead() {
        return this.item.attributes.last_chapter_read;
      },
      lastVolumeAvailable() {
        return this.item.attributes.last_volume_available;
      },
      lastChapterAvailable() {
        return this.item.attributes.last_chapter_available;
      },
      tippyEnabled() {
        const { titleLink } = this.$refs;

        return titleLink.scrollWidth > titleLink.clientWidth;
      },
    },
    methods: {
      sanitizeTitle(title) {
        return he.decode(title);
      },
      formatTime(datetime) {
        return dayjs(datetime).format('lll');
      },
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

<style lang="css" scoped>
</style>
