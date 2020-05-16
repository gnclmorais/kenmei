<template lang="pug">
  .flex.flex-col.items-center
    .flex.flex-col.w-full.max-w-7xl.py-6
      .mx-5.mb-5.max-sm_mx-2
        el-select.ml-3.sm_shadow-md.rounded.float-right.w-40(
          v-model="selectedStatus"
          placeholder="Filter by status"
          :disabled="listsLoading"
        )
          el-option(
            v-for="status in allStatuses"
            :key="status.enum"
            :label="status.name"
            :value="status.enum"
          )
        el-select.sm_shadow-md.rounded.float-right.w-48(
          ref="tagFilter"
          v-if="lists.length"
          v-model="selectedListIDs"
          placeholder="Filter by tags"
          :disabled="listsLoading"
          multiple
          collapse-tags
        )
          el-option(
            v-for="list in lists"
            :key="list.id"
            :label="list.attributes.name"
            :value="list.id"
          )
      .mx-5.mb-5.max-sm_mx-2
        .el-input.el-input--prefix.sm_shadow-md.rounded.float-right.w-64
          input.el-input__inner(
            placeholder="Input manga title"
            v-model='debouncedSearchTerm'
          )
          span.el-input__prefix
            i.el-input__icon.el-icon-search
      .mx-5.mb-5.max-sm_mx-2.max-sm_flex.max-sm_flex-col
        .bulk-actions.inline-block.max-sm_mb-5.max-sm_float-right
          el-button.sm_shadow(
            v-show="entriesSelected"
            content="Delete"
            ref="removeSeriesButton"
            icon="el-icon-delete"
            type="danger"
            size="medium"
            @click="deleteEntries"
            circle
            v-tippy
          )
          el-button.sm_shadow(
            v-show="entriesSelected"
            content="Edit"
            ref="editMangaEntriesButton"
            icon="el-icon-edit-outline"
            type="info"
            size="medium"
            @click="editDialogVisible = true"
            circle
            v-tippy
          )
          el-button.sm_shadow(
            v-show="entriesSelected"
            content="Report manga issues"
            ref="reportMangaEntriesButton"
            icon="el-icon-document-delete"
            type="warning"
            size="medium"
            @click="reportDialogVisible = true"
            circle
            v-tippy
          )
        .actions.inline-block.float-right.sm_flex.sm_flex-row-reverse
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
        @dialogClosed='dialogVisible = false'
      )
      edit-manga-entries(
        ref='editMangaEntryModal'
        :visible='editDialogVisible'
        :selectedEntries='selectedEntries'
        @cancelEdit='editDialogVisible = false'
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
    Message, Button, Input, Select, Option,
  } from 'element-ui';

  import Importers from '@/components/TheImporters';
  import AddMangaEntry from '@/components/manga_entries/AddMangaEntry';
  import DeleteMangaEntries from '@/components/manga_entries/DeleteMangaEntries';
  import EditMangaEntries from '@/components/manga_entries/EditMangaEntries';
  import ReportMangaEntries from '@/components/manga_entries/ReportMangaEntries';
  import TheMangaList from '@/components/TheMangaList';
  import { bulkDeleteMangaEntries } from '@/services/api';

  export default {
    name: 'MangaList',
    components: {
      Importers,
      AddMangaEntry,
      EditMangaEntries,
      DeleteMangaEntries,
      ReportMangaEntries,
      TheMangaList,
      'el-button': Button,
      'el-input': Input,
      'el-select': Select,
      'el-option': Option,
    },
    data() {
      return {
        selectedEntries: [],
        selectedListIDs: [],
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
        'lists',
        'statuses',
        'listsLoading',
      ]),
      ...mapGetters('lists', [
        'getEntriesByListIDs',
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
            (trackedEntry) => trackedEntry.id
          )
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

        if (this.selectedListIDs.length) {
          const taggedEntries = this.getEntriesByListIDs(this.selectedListIDs);

          filtered = filtered.filter((e) => taggedEntries.includes(e));
        }
        if (this.selectedStatus) {
          const statusEntries = this.getEntriesByStatus(this.selectedStatus);

          filtered = filtered.filter((e) => statusEntries.includes(e));
        }
        if (this.searchTerm.length) {
          filtered = filtered.filter(
            (entry) => entry.attributes.title.toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          );
        }

        return filtered;
      },
    },
    async created() {
      this.setListsLoading(true);

      await this.getLists();
      await this.getEntries();

      this.setListsLoading(false);
    },
    mounted() {
      VueScrollTo.scrollTo('header');
    },
    methods: {
      ...mapActions('lists', [
        'getLists',
        'getEntries',
      ]),
      ...mapMutations('lists', [
        'removeEntries',
        'setListsLoading',
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
            'Deletion failed. Try reloading the page before trying again'
          );
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
  .el-button.float-right + .el-button.float-right {
    @apply ml-0;
  }
</style>
