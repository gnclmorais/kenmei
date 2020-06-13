<template lang="pug">
  .relative.inline-block.text-left
    button(@click='open = !open')
      icon-dots-vertical.h-5.w-5
    button.fixed.inset-0.h-full.w-full.cursor-default(
      ref="clickOffButton"
      v-if='open'
      @click='open = false'
      tabindex='-1'
    )
    transition(name="dropdown")
      .dropdown-body(v-show='open' :class="sizes[size]")
        .rounded-md.bg-white.shadow-xs
          .py-1
            a.group(
              v-for="(item, index) in items"
              :key="index"
              href='#'
              @click.prevent="handleClick(item.text)"
            )
              component.icon.group-hover_text-gray-500.group-focus_text-gray-500(
                v-if="item.icon"
                :is="item.icon"
              )
              | {{ item.text }}
</template>

<script>
  export default {
    props: {
      items: {
        type: Array,
        required: true,
      },
      size: {
        type: String,
        default: '4xl',
      },
    },
    data() {
      return {
        open: false,
        sizes: {
          lg: 'w-32',
          '3xl': 'w-48',
          '4xl': 'w-56',
        },
      };
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
      handleClick(itemText) {
        this.$emit('click', itemText);
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

  button {
    @apply flex items-center text-gray-400;

    &:hover {
      @apply text-gray-600;
    }

    &:focus {
      @apply outline-none text-gray-600;
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
</style>
