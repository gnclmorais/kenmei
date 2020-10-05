<template lang="pug">
  button(
    :type='type'
    :class='classes'
    :disabled='disabled'
    @click="$emit('click')"
  )
    slot
</template>

<script>
  export default {
    props: {
      type: {
        type: String,
        default: 'button',
      },
      colour: {
        type: String,
        default: 'primary',
      },
      size: {
        type: String,
        default: 'md',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      classes() {
        return {
          'btn-primary': this.colour === 'primary',
          'btn-success': this.colour === 'success',
          'btn-secondary': this.colour === 'secondary',
          'btn-info': this.colour === 'info',
          'btn-warn': this.colour === 'warning',
          'btn-danger': this.colour === 'danger',
          'btn-xl': this.size === 'xl',
          'btn-lg': this.size === 'lg',
          'btn-md': this.size === 'md',
          'btn-sm': this.size === 'sm',
          'btn-xs': this.size === 'xs',
          disabled: this.disabled,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  button {
    @apply inline-flex justify-center w-full rounded-md border items-center;
    @apply font-medium shadow-sm  transition ease-in-out duration-150;

    &:focus {
      @apply outline-none;
    }
  }

  .btn-secondary {
    @apply border-gray-300 bg-white text-gray-700;

    &:hover {
      @apply text-gray-500;
    }

    &:focus {
      @apply border-blue-300 shadow-outline;
    }
  }

  .btn-primary {
    @apply border-transparent bg-blue-600 text-white;

    &:hover {
      @apply bg-blue-500;
    }

    &:focus {
      @apply border-blue-700 shadow-outline;
    }
  }

  .btn-success {
    @apply border-transparent bg-el-green text-white;

    &:hover {
      @apply bg-el-green-light;
    }

    &:focus {
      @apply border-green-500 shadow-outline;
    }
  }

  .btn-info {
    @apply border-transparent bg-gray-500 text-white;

    &:hover {
      @apply bg-gray-400;
    }

    &:focus {
      @apply border-gray-600 shadow-outline-red;
    }
  }

  .btn-warn {
    @apply border-transparent bg-yellow-400 text-white;

    &:hover {
      @apply bg-yellow-300;
    }

    &:focus {
      @apply border-yellow-500 shadow-outline-red;
    }
  }

  .btn-danger {
    @apply border-transparent bg-red-600 text-white;

    &:hover {
      @apply bg-red-500;
    }

    &:focus {
      @apply border-red-700 shadow-outline-red;
    }
  }

  .disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .btn-xl {
    @apply px-6 py-3 text-base leading-6;
  }

  .btn-lg {
    @apply px-4 py-2 text-base leading-6;
  }

  .btn-md {
    @apply px-4 py-2 text-sm leading-5;
  }

  .btn-sm {
    @apply px-3 py-2 text-sm leading-4;
  }

  .btn-xs {
    @apply px-2.5 py-1.5 text-xs leading-4;
  }
</style>
