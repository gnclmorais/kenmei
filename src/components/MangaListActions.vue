<template lang="pug">
  .mx-2.mb-5.sm_mx-5.flex.justify-between.flex-col.sm_flex-row
    .flex.flex-col.w-full.sm_flex-row
      el-select.w-full.sm_w-40(
        placeholder="Filter by status"
        :value="selectedStatus"
        @change="$emit('update:selectedStatus', $event)"
      )
        el-option(
          v-for="status in allStatuses"
          :key="status.enum"
          :label="status.name"
          :value="status.enum"
        )
      el-select.w-full.mt-3.sm_mt-0.sm_ml-3.sm_w-48(
        ref="tagFilter"
        placeholder="Filter by tags"
        :value="selectedTagIDs"
        @change="$emit('update:selectedTagIDs', $event)"
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
        @click="$emit('sortApplied', $event)"
      )
    .mt-3.text-center.w-full.float-right.sm_mt-0.sm_text-left.sm_w-64
      base-form-input(
        :value="debouncedSearchTerm"
        placeholder='Input manga title'
        type="text"
        @input="$emit('update:debouncedSearchTerm', $event)"
      )
        template(slot='icon')
          icon-search.h-5.w-5.text-gray-400
</template>

<script>
  import { Input, Select, Option } from 'element-ui';
  import { mapState } from 'vuex';
  import SortDropdown from '@/components/SortDropdown';

  export default {
    components: {
      SortDropdown,
      'el-input': Input,
      'el-select': Select,
      'el-option': Option,
    },
    props: {
      selectedStatus: {
        type: Number,
        required: true,
      },
      selectedTagIDs: {
        type: Array,
        required: true,
      },
      debouncedSearchTerm: {
        type: String,
        required: true,
      },
    },
    computed: {
      ...mapState('lists', [
        'tags',
        'statuses',
      ]),
      allStatuses() {
        return [{ enum: -1, name: 'All' }].concat(this.statuses);
      },
    },
  };
</script>
