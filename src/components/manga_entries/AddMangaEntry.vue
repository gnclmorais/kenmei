<template lang="pug">
  base-modal(
    :visible="visible"
    :loading="loading"
    size="sm"
    @dialogClosed="$emit('dialogClosed')"
  )
    template(slot='body')
      .flex-col.w-full
        base-tabs.mb-5(
          :selectedTab="selectedTab"
          :tabs="tabs"
          @tabSelected="selectedTab = $event"
        )
        .relative(v-if="selectedTab === 'Search'")
          search-manga-entries(
            :searchQuery="$v.searchQuery.$model"
            :mangaSourceID="$v.mangaSourceID.$model"
            :selectedSeriesTitle="selectedSeriesTitle"
            :validator="$v"
            @seriesSelected="selectSeries"
            @mangaSourceSelected="mangaSourceID = $event"
            @input="searchQuery = $event"
          )
        base-form-input(
          v-else
          v-model="$v.mangaURL.$model"
          :validator="$v.mangaURL"
          label="Manga URL"
          placeholder="https://www.example.com/manga"
          helperText="When using a chapter URL, last read chapter will be pre-populated"
        )
          template(slot='icon')
            icon-link.h-5.w-5
        .mt-5.text-center.sm_text-left.w-full
          label.block.text-sm.text-left.leading-5.font-medium.text-gray-700
            | Status
          .mt-1.relative.rounded-md.shadow-sm.w-auto
            el-select.rounded.w-full(v-model="selectedStatus")
              el-option(
                v-for="status in statuses"
                :key="status.enum"
                :label="status.name"
                :value="status.enum"
              )
    template(slot='actions')
      span.flex.w-full.rounded-md.shadow-sm.sm_ml-3.sm_w-auto
        base-button(ref="addMangaButton" @click="addMangaEntry")
          | Add
      span.mt-3.flex.w-full.rounded-md.shadow-sm.sm_mt-0.sm_w-auto
        base-button(colour="secondary" @click="$emit('dialogClosed')") Cancel
</template>

<script>
  import { required, url } from 'vuelidate/lib/validators';
  import { mapState, mapMutations, mapGetters } from 'vuex';
  import { Message, Select, Option } from 'element-ui';
  import debounce from 'lodash/debounce';

  import { create } from '@/services/api';

  import SearchMangaEntries from './AddMangaEntryBySearch.vue';

  export default {
    name: 'AddMangaEntry',
    components: {
      SearchMangaEntries,
      'el-select': Select,
      'el-option': Option,
    },
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      currentStatus: {
        type: Number,
        default: 1,
      },
    },
    data() {
      return {
        searchQuery: '',
        mangaURL: '',
        selectedStatus: 1,
        selectedSeriesTitle: '',
        selectedTab: 'Search',
        tabs: ['Search', 'Add with URL'],
        mangaSourceID: null,
        loading: false,
      };
    },
    validations() {
      if (this.selectedTab === 'Search') {
        return {
          searchQuery: {
            required,
          },
          selectedSeriesTitle: {
            required,
          },
          mangaSourceID: {
            required,
          },
        };
      }

      return {
        mangaURL: {
          required,
          url,
        },
      };
    },
    computed: {
      ...mapState('lists', [
        'statuses',
      ]),
      ...mapGetters('lists', [
        'findEntryFromIDs',
      ]),
    },
    watch: {
      visible: debounce(function(newVal) { //eslint-disable-line
        if (!newVal) {
          const { selectedStatus, ...original } = this.$options.data.call(this);

          // Reset data to initial state
          Object.assign(this.$data, original);
          this.$v.$reset();
        }
      }, 250),
      currentStatus(status) {
        this.selectedStatus = status === -1 ? 1 : status;
      },
      selectedTab() {
        const { selectedTab, selectedStatus, ...original } = this.$options.data.call(this);

        Object.assign(this.$data, original);
        this.$v.$reset();
      },
    },
    methods: {
      ...mapMutations('lists', [
        'addEntry',
        'replaceEntry',
      ]),
      selectSeries(title) {
        this.selectedSeriesTitle = title;
        this.mangaSourceID = null;
      },
      async addMangaEntry() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        this.loading = true;

        const response = this.mangaSourceID
          ? await create(this.mangaURL, this.selectedStatus, this.mangaSourceID)
          : await create(this.mangaURL, this.selectedStatus);

        const { status, data } = response;

        if (status === 200) {
          const entryData = data.data;

          const currentEntry = this.findEntryFromIDs(
            entryData.attributes.tracked_entries.map((e) => e.id),
          );

          if (currentEntry) {
            this.replaceEntry({ currentEntry, newEntry: entryData });
          } else {
            this.addEntry(entryData);
          }

          this.$emit('dialogClosed');

          Message.info('New Entry added');
        } else if (status === 404 || status === 406) {
          Message.info(data);
          this.loading = false;
        } else {
          Message.error('Something went wrong');
          this.$emit('dialogClosed');
        }
      },
    },
  };
</script>
