<template lang="pug">
  .relative
    template(v-if="selectedValue")
      label.mb-1(v-if="label" v-text="label")
      .flex.shadow-sm.rounded-md
        a.form-input.w-full(href='#' @click.prevent="resetSelection")
          .text-sm.leading-5.relative
            .icon.text-gray-400(v-if="$slots.icon")
              slot(name="icon")
            p.selected-value(v-text="selectedValue")
      p.mt-2.text-xs.text-gray-500(v-if="helperText" v-text="helperText")
    base-form-input(
      v-else
      ref="searchInput"
      :value="value"
      :label="label"
      :placeholder="placeholder"
      :helperText="helperText"
      :validator="validator"
      @input="debounceInput($event)"
      @focus="onFocus"
    )
      template(slot='icon')
        slot(name="icon")
    button.fixed.inset-0.h-full.w-full.cursor-default.focus_outline-none(
      ref="clickOffButton"
      v-show='dropdownOpen'
      @click='dropdownOpen = false'
      tabindex='-1'
    )
    transition(name="dropdown")
      .dropdown-body(v-show='dropdownOpen')
        overlay-scrollbars.max-h-56.rounded-md.bg-white.shadow-xs
          .py-1
            .animate-pulse.flex.space-x-4.w-full(
              v-show="loading"
              v-for="index in 4"
              :key="`skeleton-${index}`"
            )
              .flex-1.space-y-4.py-1.px-4.py-2
                .h-3.bg-gray-400.rounded
            a.dropdown-item.group(
              v-show="!loading && items.length"
              v-for="(item, index) in items"
              v-text="item"
              :key="index"
              href='#'
              @click.stop="selectSeries(item)"
            )
            p.not-found(v-show="!loading && !items.length")
              | Nothing found
</template>

<script>
  import debounce from 'lodash/debounce';
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';

  export default {
    components: {
      'overlay-scrollbars': OverlayScrollbarsComponent,
    },
    props: {
      value: {
        type: String,
        required: true,
      },
      selectedValue: {
        type: String,
        required: true,
      },
      items: {
        type: Array,
        default: () => [],
      },
      label: {
        type: String,
        default: null,
      },
      helperText: {
        type: String,
        default: null,
      },
      placeholder: {
        type: String,
        default: null,
      },
      validator: {
        type: Object,
        default: null,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        dropdownOpen: false,
      };
    },
    watch: {
      value(newValue) {
        if (newValue.length) {
          if (!this.selectedValue) { this.dropdownOpen = true; }
        } else {
          this.dropdownOpen = false;
        }
      },
    },
    methods: {
      debounceInput: debounce(function (input) { //eslint-disable-line
        this.$emit('input', input);
      }, 350),
      async resetSelection() {
        this.$emit('selected', '');
        this.dropdownOpen = true;

        await this.$nextTick();

        this.$refs.searchInput.focus();
      },
      async selectSeries(item) {
        this.$emit('selected', item);
        this.dropdownOpen = false;
      },
      onFocus() {
        if (this.value.length) { this.dropdownOpen = true; }
      },
    },
  };
</script>

<style lang="scss" scoped>
  label {
    @apply block text-sm font-medium leading-5 text-gray-700;
  }

  .not-found {
    @apply flex items-center px-4 py-2 text-sm leading-5 text-gray-700;
  }

  .icon {
    @apply absolute inset-y-0 flex items-center pointer-events-none;

    left: -1px;
  }

  .selected-value {
    @apply text-gray-900 font-medium truncate pl-7 text-base leading-6;

    @screen sm {
      @apply text-sm leading-5;
    }
  }

  .dropdown-body {
    @apply origin-top-right absolute right-0 -mt-4 rounded-md shadow-lg w-full;
    @apply z-50;
  }

  .dropdown-item {
    @apply flex items-center px-4 py-2 text-sm leading-5 text-gray-700;

    &:hover {
      @apply bg-gray-100 text-gray-900;
    }

    &:focus {
      @apply outline-none bg-gray-100 text-gray-900;
    }
  }

  // Dropdown transition

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
</style>
