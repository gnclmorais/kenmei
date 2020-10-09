<template lang="pug">
  .flex.flex-col.items-center
    .hidden.bg-white.h-48.w-full.absolute.border-b.border-gray-200.sm_block
    .flex.flex-col.w-full.max-w-7xl.pt-8.sm_py-8
      manga-list-actions(
        :selectedStatus.sync="selectedStatus"
        :selectedTagIDs.sync="selectedTagIDs"
        :debouncedSearchTerm.sync="debouncedSearchTerm"
        @sortApplied="applySort($event)"
      )
      .flex-grow.sm_mx-5.mx-0.z-10
        the-manga-list(
          ref='mangaList'
          :editMode='entriesSelected'
          @seriesSelected="handleSelection"
          @editEntry='showEditEntryDialog'
          @deleteEntry='deleteEntries'
          @importManga='importDialogVisible = true'
          @addManga='dialogVisible = true'
          @bulkDelete='deleteEntries'
          @bulkEdit='editDialogVisible = true'
          @bulkUpdate='updateEntries'
          @bulkReport='reportDialogVisible = true'
          @pageChanged="changePage($event)"
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
  import AddMangaEntry from '@/components/manga_entries/AddMangaEntry';
  import DeleteMangaEntries from '@/components/manga_entries/DeleteMangaEntries';
  import EditMangaEntries from '@/components/manga_entries/EditMangaEntries';
  import ReportMangaEntries from '@/components/manga_entries/ReportMangaEntries';
  import TheMangaList from '@/components/TheMangaList';
  import MangaListActions from '@/components/MangaListActions';
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
      MangaListActions,
      'el-select': Select,
      'el-option': Option,
    },
    data() {
      return {
        selectedEntries: [],
        selectedTagIDs: [],
        selectedSort: { Unread: 'desc' },
        selectedStatus: 1,
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
      entriesSelected() {
        return this.selectedEntries.length > 1;
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
      resetSelectedAttributes() {
        this.selectedEntries = [];
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
