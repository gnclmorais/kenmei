<template lang="pug">
  .flex.flex-col.items-center
    .hidden.bg-white.h-64.w-full.absolute.border-b.border-gray-200.sm_block
    .flex.flex-col.w-full.max-w-7xl.py-8
      .mx-2.mb-5.sm_mx-5.flex.justify-between.flex-col.sm_flex-row
        .flex.flex-col.w-full.sm_flex-row
          el-select.w-full.sm_w-40(
            v-model="selectedStatus"
            placeholder="Filter by status"
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
          sort-dropdown.w-full.mt-3.sm_mt-0.sm_ml-3.sm_w-40(
            @click="applySort($event)"
          )
        .mt-3.text-center.w-full.float-right.sm_mt-0.sm_text-left.sm_w-64
          base-form-input(
            v-model="debouncedSearchTerm"
            placeholder='Input manga title'
            type="text"
          )
            template(slot='icon')
              icon-search.h-5.w-5.text-gray-400
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
            base-button(colour="success" @click="importDialogVisible = true")
              i.el-icon-upload2.mr-1
              | Import
      .flex-grow.sm_mx-5.mx-0
        the-manga-list(
          ref='mangaList'
          @seriesSelected="handleSelection"
          @editEntry='showEditEntryDialog'
          @changePage='changePage'
          @sortingApplied='applySort'
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
  import { mapActions, mapState, mapMutations } from 'vuex';
  import { Message, Select, Option } from 'element-ui';

  import Importers from '@/components/TheImporters';
  import BulkActions from '@/components/BulkActions';
  import SortDropdown from '@/components/SortDropdown';
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
      SortDropdown,
      AddMangaEntry,
      EditMangaEntries,
      DeleteMangaEntries,
      ReportMangaEntries,
      TheMangaList,
      'el-select': Select,
      'el-option': Option,
    },
    data() {
      return {
        selectedEntries: [],
        selectedTagIDs: [],
        selectedSort: { Unread: 'desc' },
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
        'entriesPagy',
        'tags',
        'statuses',
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
        }, 350),
      },
      filters() {
        return {
          status: this.selectedStatus,
          tagIDs: this.selectedTagIDs,
          searchTerm: this.searchTerm.toLowerCase(),
        };
      },
    },
    watch: {
      async filters(newFilters) {
        this.setTagsLoading(true);

        await this.getEntries({
          page: 1,
          ...newFilters,
          sort: this.selectedSort,
        });

        this.setTagsLoading(false);
      },
    },
    async created() {
      this.setTagsLoading(true);

      await this.getTags();
      await this.getEntries({ page: 1, status: 1 });

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
      async changePage(page) {
        this.setTagsLoading(true);

        await this.getEntries({
          page,
          ...this.filters,
          sort: this.selectedSort,
        });

        this.setTagsLoading(false);
      },
      async applySort(sort) {
        this.setTagsLoading(true);

        this.selectedSort = sort;
        await this.getEntries({ page: 1, ...this.filters, sort });

        this.setTagsLoading(false);
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
