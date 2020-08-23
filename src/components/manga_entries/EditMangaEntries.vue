<template lang="pug">
  base-modal(
    :visible="visible"
    :loading="loading"
    size="sm"
    @dialogClosed="$emit('editComplete')"
  )
    template(slot='body')
      .flex.flex-col.w-full
        .mt-3.text-center.sm_mt-0.sm_text-left.w-full
          label.block.text-sm.leading-5.font-medium.text-gray-700
            | Status
          .mt-1.relative.rounded-md.shadow-sm.w-auto
            el-select.rounded.w-full(v-model="selectedStatus")
              el-option(
                v-for="status in statuses"
                :key="status.enum"
                :label="status.name"
                :value="status.enum"
              )
        .mt-5.text-center.sm_text-left.w-full(v-if="!isBulkUpdate")
          label.block.text-sm.leading-5.font-medium.text-gray-700
            | Manga Source Name
          .mt-1.relative.rounded-md.shadow-sm.w-auto
            el-select.rounded.w-full(
              v-model="mangaSourceID"
              placeholder="Select new source"
              :disabled="loadingSources"
              filterable
            )
              el-option(
                v-for="source in availableSources"
                :key="source.id"
                :label="source.name"
                :value="source.id"
              )
        .mt-5.text-center.sm_text-left.w-full(v-if="tags.length")
          label.block.text-sm.leading-5.font-medium.text-gray-700
            | Tags
          .mt-1.relative.rounded-md.shadow-sm.w-auto
            el-select.rounded.w-full(
              v-model="selectedTagIDs"
              placeholder="Select Tags"
              multiple
              collapse-tags
              filterable
            )
              el-option(
                v-for="tag in tags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              )
    template(slot='actions')
      span.sm_ml-3.flex.w-full.rounded-md.shadow-sm.sm_w-auto
        base-button(
          ref="updateEntryButton"
          @click="updateMangaEntries"
          :disabled="loadingSources"
        )
          | Update
      span.mt-3.sm_mt-0.flex.w-full.rounded-md.shadow-sm.sm_w-auto
        base-button(type="secondary" @click="$emit('editComplete')") Cancel
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import { Message, Select, Option } from 'element-ui';
  import { updateMangaEntry, bulkUpdateMangaEntry } from '@/services/api';
  import { getMangaSources } from '@/services/endpoints/MangaSources';

  export default {
    name: 'EditMangaEntries',
    components: {
      'el-select': Select,
      'el-option': Option,
    },
    props: {
      selectedEntries: {
        type: Array,
        required: true,
      },
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        selectedStatus: 1,
        selectedTagIDs: [],
        mangaSourceID: null,
        availableSources: [],
        loadingSources: false,
        loading: false,
      };
    },
    computed: {
      ...mapState('lists', [
        'statuses',
        'tags',
      ]),
      selectedEntry() {
        return this.selectedEntries[0];
      },
      selectedEntriesIDs() {
        return this.selectedEntries.map((entry) => entry.id);
      },
      selectedEntriesTagIDs() {
        if (!this.selectedEntries.length) return [];

        const tagIDs = this.selectedEntries.map((entry) => entry.user_tag_ids);

        return [].concat(...tagIDs);
      },
      isBulkUpdate() {
        return this.selectedEntries.length > 1;
      },
    },
    watch: {
      selectedEntries(entries, oldEntries) {
        if (entries.length) {
          this.selectedTagIDs = this.selectedTags();

          if (entries !== oldEntries && !this.isBulkUpdate) {
            this.selectedStatus = this.selectedEntry.attributes.status;
          }
        } else {
          this.availableSources = [];
          this.mangaSourceID = null;
          this.selectedStatus = 1;
        }
      },
      visible(val) {
        if (val && !this.isBulkUpdate) { this.loadAvailableSources(); }
      },
    },
    methods: {
      ...mapMutations('lists', [
        'updateEntry',
        'replaceEntry',
      ]),
      toggleLoading() {
        this.loadingSources = !this.loadingSources;
      },
      selectedTags() {
        return this.tags.filter(
          (tag) => this.selectedEntriesTagIDs.includes(tag.id),
        ).map((tag) => tag.id);
      },
      async loadAvailableSources() {
        this.toggleLoading();

        const response = await getMangaSources(
          this.selectedEntry.manga_series_id,
        );

        if (response) {
          this.toggleLoading();

          this.availableSources = response.data;
          this.mangaSourceID = this.selectedEntry.manga_source_id;
        } else {
          Message.error(
            "Couldn't fetch available manga sites. Try refreshing the page",
          );
        }
      },
      async updateMangaEntries() {
        this.loading = true;
        const params  = {
          status: this.selectedStatus,
          user_tag_ids: this.selectedTagIDs,
        };

        if (!this.isBulkUpdate) { params.manga_source_id = this.mangaSourceID; }

        const response = this.isBulkUpdate
          ? await bulkUpdateMangaEntry(this.selectedEntriesIDs, params)
          : await updateMangaEntry(this.selectedEntry.id, params);

        this.loading = false;

        if (response) {
          Message.info(`${this.selectedEntries.length} entries updated`);

          if (Array.isArray(response)) {
            response.map((e) => this.updateEntry(e));
          } else {
            this.replaceEntry({
              currentEntry: this.selectedEntry, newEntry: response,
            });
          }

          this.$emit('editComplete');
        } else {
          Message.error("Couldn't update. Try refreshing the page");
        }
      },
    },
  };
</script>
