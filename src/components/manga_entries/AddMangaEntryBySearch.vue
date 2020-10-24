<template lang="pug">
  .relative
    base-form-autocomplete(
      label="Series title"
      placeholder="One Piece"
      helperText="You can search by English or Romaji titles"
      :value="searchQuery"
      :selectedValue="selectedSeriesTitle"
      :items="seriesTitles"
      :loading="loading"
      :validator="validator.searchQuery"
      @selected="$emit('seriesSelected', $event)"
      @input="$emit('input', $event)"
    )
      template(slot='icon')
        icon-search.h-5.w-5
    .mt-5.text-left.w-full.sm_block(:class="responsiveClasses")
      label.block.text-sm.font-medium.leading-5.text-gray-700
        | Source Name
        transition(name='slide')
          span.leading-none.ml-1.text-xs.text-red-600(v-if="hasErrors")
            | required
      .mt-1.relative.rounded-md.shadow-sm.w-auto
        el-select.rounded.w-full(
          placeholder="Select series first"
          :value="mangaSourceID"
          :disabled="!availableSources.length"
          @change="$emit('mangaSourceSelected', $event)"
        )
          el-option(
            v-for="source in availableSources"
            :key="source.id"
            :label="source.name"
            :value="source.id"
          )
</template>

<script>
  import debounce from 'lodash/debounce';
  import he from 'he';
  import { Message, Select, Option } from 'element-ui';
  import { mapState } from 'vuex';

  import { index } from '@/services/endpoints/v1/manga_series';

  export default {
    components: {
      'el-select': Select,
      'el-option': Option,
    },
    props: {
      searchQuery: {
        type: String,
        required: true,
      },
      mangaSourceID: {
        type: Number,
        default: null,
      },
      selectedSeriesTitle: {
        type: String,
        default: '',
      },
      validator: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        loading: false,
        items: [],
      };
    },
    computed: {
      ...mapState('lists', [
        'statuses',
      ]),
      responsiveClasses() {
        return {
          hidden: !this.availableSources.length,
        };
      },
      hasErrors() {
        const { mangaSourceID } = this.validator;

        return !mangaSourceID.required
          && mangaSourceID.$dirty
          && this.availableSources.length;
      },
      seriesTitles() {
        return this.items.map((item) => he.decode(item.title));
      },
      selectedSeries() {
        return this.items
          .find((item) => item.title === this.selectedSeriesTitle);
      },
      availableSources() {
        if (!this.selectedSeries) { return []; }

        return this.selectedSeries.mangaSources;
      },
    },
    watch: {
      async searchQuery(title) {
        this.validator.$touch();
        if (this.validator.searchQuery.$error) {
          this.resetItems();
          return;
        }

        this.loading = true;

        const response = await index(title);
        const { status, data } = response;

        if (status === 200) {
          this.items = data.data;
        } else {
          Message.error(
            "Couldn't fetch series. Try refreshing the page before trying again",
          );
        }

        this.loading = false;
      },
      availableSources(sources) {
        if (!sources.length) return;

        this.$emit('mangaSourceSelected', sources[0].id);
      },
    },
    methods: {
      resetItems: debounce(function (_e) { // eslint-disable-line func-names
        this.items = [];
      }, 200),
    },
  };
</script>

<style lang="scss" scoped>
  .slide-enter-active,
  .slide-leave-active {
    @apply transition ease-in duration-200 transition-all overflow-hidden;
  }

  .slide-enter,
  .slide-leave-to {
    @apply opacity-0 transform -translate-y-1;
  }
</style>
