<template lang="pug">
  .flex.items-center
    base-form-checkbox.h-5.w-4(
      v-if="entriesLoading || entriesPagy.count"
      :value="selectAllChecked"
      :indeterminate="indeterminate"
      :disabled="entriesLoading"
      :class="checkBoxClasses"
      @input="selectAll"
    )
    .pl-6.sm_pl-10
      .animate-pulse.flex.space-x-4.w-48(v-if="entriesLoading")
        .flex-1.space-y-4.py-1
          .h-3.bg-gray-400.rounded
      template(v-else)
        p.text-sm.leading-5.text-gray-700(v-if="selectedEntries.length")
          | Selected
          |
          span.font-medium(v-text="selectedEntries.length")
          |
          |  entries
        base-pagination-info(v-else-if="entriesPagy.count" :pagy="entriesPagy")
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    props: {
      selectedEntries: {
        type: Array,
        required: true,
      },
    },
    computed: {
      ...mapState('lists', [
        'entriesPagy',
        'entriesLoading',
      ]),
      selectAllChecked() {
        return this.selectedEntries.length > 0 && !this.indeterminate;
      },
      indeterminate() {
        return this.selectedEntries.length > 0
          && this.selectedEntries.length !== this.entriesPagy.to;
      },
      checkBoxClasses() {
        return {
          'hidden sm_flex': !this.selectedEntries.length,
          flex: this.selectedEntries.length,
        };
      },
    },
    methods: {
      selectAll(state) {
        if (this.indeterminate) {
          this.$emit('selectAll', true);
        } else {
          this.$emit('selectAll', state);
        }
      },
    },
  };
</script>

<style lang="css" scoped>
</style>
