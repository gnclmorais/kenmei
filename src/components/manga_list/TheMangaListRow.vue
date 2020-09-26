<template lang="pug">
  a.list-row.group(:class="classes" v-touch:touchhold="selectEntry")
    .flex.items-center.px-4.py-4
      base-form-checkbox.h-5.w-4(
        :value='itemSelected'
        :disabled='entriesLoading'
        :class='checkBoxClasses'
        @input="$emit('entrySelected', item, $event)"
      )
      row-skeleton.ml-6.sm_ml-10(v-if="entriesLoading")
      template(v-else)
        span.relative(:class="pingClasses")
          span(v-if="!item.attributes.unread")
          template(v-else)
            span.animate-ping.absolute.inline-flex.h-full.w-full.rounded-full.bg-blue-400.opacity-75
            span.relative.inline-flex.rounded-full.bg-blue-500(class="w-2.5 h-2.5")
        row-body(:item="item")
        .actions
          .row-actions.hidden.sm_group-hover_opacity-100.sm_block.sm_opacity-0
            base-icon-button-group(
              :buttons="dropdownItems"
              @click="handleClick($event)"
            )
          base-dropdown.block.sm_hidden(
            :items="dropdownItems"
            size="lg"
            @click="handleClick($event)"
          )
</template>

<script>
  import { mapState } from 'vuex';

  import RowBody from './TheMangaListRowBody.vue';
  import RowSkeleton from './TheMangaListRowSkeleton.vue';

  export default {
    components: {
      RowBody,
      RowSkeleton,
    },
    props: {
      item: {
        type: Object,
        required: true,
      },
      itemSelected: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        dropdownItems: [
          {
            text: 'Set chapter to last read',
            icon: 'IconCheckCircle',
            colour: 'success',
          },
          {
            text: 'Edit',
            icon: 'IconEdit',
            colour: 'primary',
          },
          {
            text: 'Delete',
            icon: 'IconTrash',
            colour: 'danger',
          },
        ],
      };
    },
    computed: {
      ...mapState('lists', [
        'entries',
        'tagsLoading',
        'entriesLoading',
      ]),
      classes() {
        return {
          'sm_hover_bg-gray-50': !this.itemSelected,
          'bg-blue-100 bg-opacity-50': this.itemSelected,
        };
      },
      checkBoxClasses() {
        return {
          'hidden sm_flex': !this.itemSelected,
          flex: this.itemSelected,
        };
      },
      pingClasses() {
        return {
          'w-2.5 h-2.5 flex': true,
          'sm_ml-4': !this.itemSelected,
          'ml-4 hidden sm_flex': this.itemSelected,
        };
      },
    },
    methods: {
      selectEntry() {
        this.$emit('entrySelected', this.item, !this.itemSelected);
      },
      handleClick(action) {
        if (action === 'Edit') {
          this.$emit('editEntry', this.item);
        } else if (action === 'Set chapter to last read') {
          this.$emit('setLastRead', this.item);
        } else if (action === 'Delete') {
          this.$emit('deleteEntry', this.item);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-row {
    @apply block relative;
    @apply transition duration-150 ease-in-out;

    // &:hover {
    //   @apply bg-gray-50;
    // }

    &:focus {
      @apply outline-none bg-gray-50;
    }
  }

  .row-actions {
    @apply absolute transition duration-150 ease-in-out;

    top: -16px;
    right: 10px;
  }
</style>
