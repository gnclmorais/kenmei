<template lang="pug">
  .bg-white.shadow.overflow-hidden.sm_rounded-md
    .border-b.border-gray-200.px-4.py-5.sm_px-6
      .-ml-4.-mt-2.flex.items-center.justify-between.flex-wrap.sm_flex-no-wrap
        manga-list-header.ml-4.mt-2.sm_ml-2(
          :selectedEntries="selectedEntries"
          @selectAll="selectAllEntries"
        )
        actions(
          :editMode="editMode"
          @importManga='$emit($event)'
          @addManga="$emit($event)"
          @bulkDelete="$emit($event)"
          @bulkEdit="$emit($event)"
          @bulkUpdate='$emit($event)'
          @bulkReport="$emit($event)"
        )
    ul.divide-y.divide-gray-200
      template(v-if="entries.length")
        li.transition.duration-150.ease-in-out(
          v-for="(item, index) in entries"
          :key="item.id"
        )
          manga-list-row(
            :item="item"
            :itemSelected="selectedEntries.includes(item)"
            @entrySelected="handleSelectionChange"
            @setLastRead="setLastRead"
            @editEntry="$emit('editEntry', $event)"
            @deleteEntry="$emit('deleteEntry', $event)"
          )
      template(v-else)
        template(v-if="entriesLoading")
          li(v-for="index in 2" :key="index")
            a.block.relative
              .flex.items-center.px-4.py-4
                base-form-checkbox.h-5.w-4.hidden.sm_flex(
                  :value='false'
                  :disabled='true'
                )
                manga-list-row-skeleton.ml-10
        li(v-else)
          a.block.px-48.text-center
            .flex.items-center.justify-center.px-4.py-12.sm_px-6
              .text-base.leading-5.font-medium.text-gray-500
                template(v-if='entries.length')
                  | No entries found.
                  | Try changing your filters
                template(v-else)
                  | You haven't imported manga yet. Add a new manga series by
                  | pressing Add Manga and providing a URL. Or press Import, to
                  | import your manga from TrackrMoe or MangaDex
    .pagination(v-if="entries.length")
      .flex-1.flex.justify-center.sm_items-center.sm_justify-between
        div.hidden.sm_block.pl-12(v-if="entriesPagy.count")
          base-pagination-info(:pagy="entriesPagy" :loading="entriesLoading")
        div(v-if="entriesPagy.pages > 1")
          base-pagination-pager(
            :pagy="entriesPagy"
            @pageChanged="$emit('pageChanged', $event)"
          )
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import { Message } from 'element-ui';

  import { updateMangaEntry } from '@/services/api';

  import Actions from './TheMangaListActions.vue';
  import MangaListRow from './manga_list/TheMangaListRow.vue';
  import MangaListRowSkeleton from './manga_list/TheMangaListRowSkeleton.vue';
  import MangaListHeader from './TheMangaListHeader.vue';

  export default {
    components: {
      Actions,
      MangaListRow,
      MangaListRowSkeleton,
      MangaListHeader,
    },
    props: {
      editMode: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        selectedEntries: [],
        entryUpdated: null,
        dropdownItems: [
          { text: 'Set chapter to last read', icon: 'IconCheckCircle2' },
          { text: 'Edit', icon: 'IconEdit' },
          { text: 'Delete', icon: 'IconTrash' },
        ],
      };
    },
    computed: {
      ...mapState('lists', [
        'entries',
        'entriesPagy',
        'statuses',
        'tagsLoading',
        'entriesLoading',
      ]),
    },
    methods: {
      ...mapMutations('lists', [
        'updateEntry',
      ]),
      chapterInfo(volume, chapter) {
        if (chapter) {
          const chapterNumber = parseFloat(chapter);

          if (volume && volume !== '0') { return `Vol. ${volume} Ch. ${chapter}`; }

          // TODO: Replace when we return titles separately from the chapter
          if (Number.isNaN(chapterNumber)) return chapter;

          return `Ch. ${chapter}`;
        }

        return '';
      },
      async setLastRead(entry) {
        this.entryUpdated = entry;

        const attributes = {
          last_volume_read: entry.attributes.last_volume_available,
          last_chapter_read: entry.attributes.last_chapter_available,
          last_chapter_read_url: entry.links.last_chapter_available_url,
        };

        const response = await updateMangaEntry(entry.id, attributes);
        if (response) {
          const lastRead = this.chapterInfo(
            attributes.last_volume_read, attributes.last_chapter_read,
          );

          Message.info(`Updated last read to ${lastRead}`);
          this.updateEntry(response);
        } else {
          Message.error("Couldn't update. Try refreshing the page");
        }

        this.entryUpdated = null;
      },
      handleSelectionChange(entry, selected) {
        if (selected) {
          this.selectedEntries.push(entry);
        } else {
          this.selectedEntries = this.selectedEntries.filter((e) => e !== entry);
        }

        this.$emit('seriesSelected', this.selectedEntries);
      },
      selectAllEntries(state) {
        if (state) {
          this.selectedEntries = this.entries;
        } else {
          this.selectedEntries = [];
        }

        this.$emit('seriesSelected', this.selectedEntries);
      },
    },
  };
</script>

<style media="screen" lang="scss" scoped>
  .border-l-blue-500 {
    border-left-color: #4299e1;
  }

  .pagination {
    @apply bg-white px-4 py-3 flex items-center justify-between;
    @apply border-t border-gray-200;

    @screen sm {
      @apply px-6;
    }
  }
</style>
