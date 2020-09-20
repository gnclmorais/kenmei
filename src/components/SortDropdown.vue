<template lang="pug">
  .relative.inline-block.text-left
    span.rounded-md.shadow-sm
      button.sort-button(
        @click='open = !open'
        type='button'
        aria-haspopup='true'
        aria-expanded='false'
      )
        .flex.w-full.justify-start
          icon-sort-asc.mr-3.h-5.w-5.text-gray-400(
            v-if="sortDirection === 'asc'"
          )
          icon-sort-desc.mr-3.h-5.w-5.text-gray-400(v-else)
          | {{ selectedSort }}
        icon-chevron-down.chevron.transform(:class="{ '-rotate-180': open }")
    button.fixed.inset-0.h-full.w-full.cursor-default.focus_outline-none(
      ref="clickOffButton"
      v-if='open'
      @click='open = false'
      tabindex='-1'
    )
    transition(name="dropdown")
      .dropdown-body.w-full.sm_w-40(v-show='open')
        .rounded-md.bg-white.shadow-xs
          .py-1
            a.group(
              v-for="(item, index) in items"
              :key="index"
              href='#'
              @click.prevent="handleClick(item.text)"
            )
              component.icon(
                v-if="item.icon"
                :is="item.icon"
                class="group-hover_text-gray-500 group-focus_text-gray-500"
              )
              | {{ item.text }}
</template>

<script>
  export default {
    data() {
      return {
        open: false,
        sortDirection: 'desc',
        selectedSort: 'Unread',
        items: [
          { text: 'Unread' },
          { text: 'Title' },
          { text: 'Released' },
        ],
      };
    },
    computed: {
      riversedSortDirection() {
        return { desc: 'asc', asc: 'desc' }[this.sortDirection];
      },
    },
    created() {
      const handleEscape = (e) => {
        if (e.key === 'Esc' || e.key === 'Escape') { this.open = false; }
      };

      document.addEventListener('keydown', handleEscape);
      this.$once('hook:beforeDestroy', () => {
        document.removeEventListener('keydown', handleEscape);
      });
    },
    methods: {
      switchDirection(newSort) {
        if (newSort === this.selectedSort) {
          this.sortDirection = this.riversedSortDirection;
          this.selectedSort = newSort;
          return;
        }

        this.selectedSort = newSort;
        this.sortDirection = 'desc';
      },
      handleClick(itemText) {
        this.switchDirection(itemText);
        this.$emit('click', { [itemText]: this.sortDirection });
        this.open = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  a {
    @apply flex items-center px-4 py-2 text-sm leading-5 text-gray-700;

    &:hover {
      @apply bg-gray-100 text-gray-900;
    }

    &:focus {
      @apply outline-none bg-gray-100 text-gray-900;
    }
  }

  .sort-button {
    @apply inline-flex justify-center w-full rounded-md border border-gray-300;
    @apply px-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700;
    @apply transition ease-in-out duration-150;

    &:hover {
      @apply text-gray-500;
    }

    &:focus {
      @apply outline-none border-blue-300 shadow-outline-blue;
    }

    &:active {
      @apply bg-gray-50 text-gray-800;
    }
  }

  .icon {
    @apply mr-3 h-5 w-5 text-gray-400;
  }

  .dropdown-body {
    min-width: -webkit-max-content;
    min-width: -moz-max-content;
    min-width: max-content;
    @apply origin-top-right absolute right-0 mt-2 rounded-md shadow-lg;
    @apply z-20;
  }

  .dropdown-enter-active {
    @apply ease-out duration-100;
  }

  .dropdown-leave-active {
    @apply ease-in duration-75;
  }

  .dropdown-enter,
  .dropdown-leave-to {
    @apply transform opacity-0 scale-95;
  }

  .dropdown-enter-to,
  .dropdown-leave {
    @apply transform opacity-100 scale-100;
  }

  // Chevron rotation transition
  .chevron {
    @apply h-5 w-5 text-gray-400 transition-transform duration-200 ease-in-out;
    @apply ml-2.5 -mr-1.5;
  }
</style>
