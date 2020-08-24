<template lang="pug">
  .flex.flex-col.items-center
    .hidden.bg-white.h-64.w-full.absolute.border-b.border-gray-200.sm_block
    .flex.flex-col.w-full.max-w-7xl.py-8
      .mx-2.mb-5.sm_mx-5
        el-select.w-full.sm_w-40(
          v-model="selectedStatus"
          placeholder="Filter by status"
          :disabled="tagsLoading"
        )
          el-option(
            v-for="status in allStatuses"
            :key="status.enum"
            :label="status.name"
            :value="status.enum"
          )
        el-select.w-full.mt-3.sm_mt-0.sm_ml-3.sm_w-48(
          ref="tagFilter"
          v-model="selectedTagIDs"
          placeholder="Filter by tags"
          :disabled="tagsLoading"
          multiple
          collapse-tags
          filterable
        )
          template(slot='empty')
            .relative.p-3.font-normal.text-sm.text-center
              span.text-gray-400
                | No tags found. Create new tags in
              router-link.inline.text-blue-500.hover_text-blue-600(
                to="settings"
                exact
              )
                |  Settings
          el-option(
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          )
        .mt-3.text-center.w-full.float-right.sm_mt-0.sm_text-left.sm_w-64
          .relative.rounded-md.shadow-sm
            .absolute.inset-y-0.left-0.pl-3.flex.items-center.pointer-events-none
              svg.h-5.w-5.text-gray-400(fill='currentColor' viewbox='0 0 20 20')
                path(
                  fill-rule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clip-rule='evenodd'
                )
            input.form-input.block.w-full.pl-10.sm_text-sm.sm_leading-5(
              v-model="debouncedSearchTerm"
              placeholder='Input manga title'
            )
      .mx-5.mb-5.max-sm_mx-2.max-sm_flex.max-sm_flex-col
        bulk-actions.mb-3.sm_mb-0(
          v-show="entriesSelected"
          @delete="deleteEntries"
          @edit="editDialogVisible = true"
          @read="updateEntries"
          @report="reportDialogVisible = true"
        )
        .actions.inline-block.float-right.sm_flex.sm_flex-row-reverse.relative
          span.sm_ml-3.flex.w-full.rounded-md.shadow-sm.sm_w-auto
            base-button(
              ref="addMangaEntryModalButton"
              @click="dialogVisible = true"
            )
              i.el-icon-plus.mr-1
              | Add Manga
          span.flex.mt-3.sm_mt-0.w-full.rounded-md.shadow-sm.sm_w-auto
            base-button(type="success" @click="importDialogVisible = true")
              i.el-icon-upload2.mr-1
              | Import
      .flex-grow.sm_mx-5.mx-0
        the-manga-list(
          ref='mangaList'
          :tableData='filteredEntries || entries'
          @seriesSelected="handleSelection"
          @editEntry='showEditEntryDialog'
        )
      importers(
        :visible='importDialogVisible'
        @closeDialog="importDialogVisible = false"
      )
      add-manga-entry(
        ref='addMangaEntryModal'
        :visible="dialogVisible"
        :currentStatus="selectedStatus"
        @dialogClosed='dialogVisible = false'
      )
      edit-manga-entries(
        ref='editMangaEntryModal'
        :visible='editDialogVisible'
        :selectedEntries='selectedEntries'
        @editComplete="resetEntries('editDialogVisible')"
      )
      delete-manga-entries(
        :visible='deleteDialogVisible'
        @dialogClosed='deleteDialogVisible = false'
        @confirmDeletion='deleteDialogVisible = false; removeSeries()'
      )
      report-manga-entries(
        :selectedEntries='selectedEntries'
        :visible='reportDialogVisible'
        @closeDialog="resetEntries('reportDialogVisible')"
      )
</template>

<script>
  import VueScrollTo from 'vue-scrollto';
  import debounce from 'lodash/debounce';
  import {
    mapActions, mapState, mapMutations, mapGetters,
  } from 'vuex';
  import {
    Message, Input, Select, Option,
  } from 'element-ui';

  import Importers from '@/components/TheImporters';
  import BulkActions from '@/components/BulkActions';
  import AddMangaEntry from '@/components/manga_entries/AddMangaEntry';
  import DeleteMangaEntries from '@/components/manga_entries/DeleteMangaEntries';
  import EditMangaEntries from '@/components/manga_entries/EditMangaEntries';
  import ReportMangaEntries from '@/components/manga_entries/ReportMangaEntries';
  import TheMangaList from '@/components/TheMangaList';
  import { bulkDeleteMangaEntries } from '@/services/api';
  import { update } from '@/services/endpoints/manga_entries_collections';

  export default {
    name: 'MangaList',
    components: {
      Importers,
      BulkActions,
      AddMangaEntry,
      EditMangaEntries,
      DeleteMangaEntries,
      ReportMangaEntries,
      TheMangaList,
      'el-input': Input,
      'el-select': Select,
      'el-option': Option,
    },
    data() {
      return {
        selectedEntries: [],
        selectedTagIDs: [],
        selectedStatus: 1,
        entriesSelected: false,
        searchTerm: '',
        dialogVisible: false,
        importDialogVisible: false,
        editDialogVisible: false,
        deleteDialogVisible: false,
        reportDialogVisible: false,
      };
    },
    computed: {
      ...mapState('lists', [
        'entries',
        'tags',
        'statuses',
        'tagsLoading',
      ]),
      ...mapGetters('lists', [
        'getEntriesByTagIDs',
        'getEntriesByStatus',
      ]),
      allStatuses() {
        return [{ enum: -1, name: 'All' }].concat(this.statuses);
      },
      selectedEntriesIDs() {
        return this.selectedEntries.map((entry) => entry.id);
      },
      trackedEntriesIDs() {
        const trackedIDs = this.selectedEntries.map(
          (entry) => entry.attributes.tracked_entries.map(
            (trackedEntry) => trackedEntry.id,
          ),
        );

        return [].concat(...trackedIDs);
      },
      debouncedSearchTerm: {
        get() {
          return this.searchTerm;
        },
        set: debounce(function(newVal) { //eslint-disable-line
          if (newVal !== this.searchTerm) { this.searchTerm = newVal; }
        }, 250),
      },
      filteredEntries() {
        let filtered = this.entries;

        if (this.selectedTagIDs.length) {
          const taggedEntries = this.getEntriesByTagIDs(this.selectedTagIDs);

          filtered = filtered.filter((e) => taggedEntries.includes(e));
        }
        if (this.selectedStatus) {
          const statusEntries = this.getEntriesByStatus(this.selectedStatus);

          filtered = filtered.filter((e) => statusEntries.includes(e));
        }
        if (this.searchTerm.length) {
          filtered = filtered.filter(
            (entry) => entry.attributes.title.toLowerCase()
              .includes(this.searchTerm.toLowerCase()),
          );
        }

        return filtered;
      },
    },
    async created() {
      this.setTagsLoading(true);

      await this.getTags();
      await this.getEntries();

      this.setTagsLoading(false);
    },
    mounted() {
      VueScrollTo.scrollTo('#home');
    },
    methods: {
      ...mapActions('lists', [
        'getTags',
        'getEntries',
      ]),
      ...mapMutations('lists', [
        'removeEntries',
        'setTagsLoading',
        'updateEntry',
      ]),
      handleSelection(selectedEntries) {
        this.entriesSelected = selectedEntries.length > 0;
        this.selectedEntries = selectedEntries;
      },
      deleteEntries() {
        if (this.trackedEntriesIDs.length > this.selectedEntriesIDs.length) {
          this.deleteDialogVisible = true;
        } else {
          this.removeSeries();
        }
      },
      async removeSeries() {
        const successful = await bulkDeleteMangaEntries(this.trackedEntriesIDs);

        if (successful) {
          Message.info(`${this.trackedEntriesIDs.length} entries deleted`);
          this.removeEntries(this.trackedEntriesIDs);
        } else {
          Message.error(
            'Deletion failed. Try reloading the page before trying again',
          );
        }
      },
      async updateEntries() {
        const attributes = this.selectedEntries.map((entry) => ({
          id: entry.id,
          last_volume_read: entry.attributes.last_volume_available,
          last_chapter_read: entry.attributes.last_chapter_available,
          last_chapter_read_url: entry.links.last_chapter_available_url,
        }));

        const response = await update(attributes);
        const { status, data } = response;

        if (status === 200) {
          data.data.map((e) => this.updateEntry(e));
          Message.info(`Updated ${attributes.length} entries`);
          this.resetSelectedAttributes();
        } else {
          Message.error("Couldn't update. Try refreshing the page");
        }
      },
      resetEntries(dialogName) {
        this[dialogName] = false;
        this.resetSelectedAttributes();
      },
      clearTableSelection() {
        this.$refs.mangaList.$refs.mangaListTable.clearSelection();
      },
      resetSelectedAttributes() {
        this.selectedEntries = [];
        this.clearTableSelection();
      },
      showEditEntryDialog(entry) {
        this.selectedEntries = [entry];
        this.editDialogVisible = true;
      },
    },
  };
</script>

<style media="screen" lang="scss">
  .el-input__inner {
    @apply rounded-md;
  }
</style>
