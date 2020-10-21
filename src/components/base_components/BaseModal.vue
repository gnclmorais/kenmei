<template lang="pug">
  transition(leave-active-class='duration-300')
    .modal(ref='modal' v-show="visible")
      transition(name="overlay-fade")
        .fixed.inset-0.transition-opacity(ref="modalMask" v-show="visible")
          .absolute.inset-0.bg-gray-500.opacity-75
      transition(name="modal-slide")
        .modal-body(v-show="visible" v-loading="loading" :class="classes")
          .bg-white.px-4.pt-5.pb-4.sm_p-6.sm_pb-4
            .sm_flex.sm_items-from
              slot(name="body")
          .modal-actions(v-if="$slots.actions")
            slot(name="actions")
</template>

<script>
  import {
    disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks,
  } from 'body-scroll-lock';

  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      size: {
        type: String,
        default: 'md',
      },
    },
    computed: {
      classes() {
        return {
          'sm_max-w-xs': this.size === 'xs',
          'sm_max-w-sm': this.size === 'sm',
          'sm_max-w-md': this.size === 'md',
          'sm_max-w-lg': this.size === 'lg',
        };
      },
    },
    watch: {
      visible(val) {
        if (val) {
          // reserveScrollBarGap applies padding when disabling scrollbar
          disableBodyScroll(this.$refs.modal, { reserveScrollBarGap: true });
        } else {
          // Need to wait for animation to finish, to avoid content jump due to
          // padding change
          setTimeout(() => { enableBodyScroll(this.$refs.modal); }, 200);
        }
      },
    },
    destroyed() {
      // I need to enable body scroll, in case modal gets destroyed before the
      // prop change
      clearAllBodyScrollLocks();
    },
    mounted() {
      document.addEventListener('keydown', (event) => {
        event.stopPropagation();

        if (this.visible && event.keyCode === 27) {
          this.$emit('dialogClosed');
        }
      });

      this.$refs.modalMask.addEventListener('click', (event) => {
        event.stopPropagation();

        this.$emit('dialogClosed');
      });
    },
  };
</script>

<style lang="scss" scoped>
  .modal {
    @apply fixed bottom-0 inset-x-0 px-4 pb-4 z-50;
    @screen sm {
      @apply flex items-center justify-center inset-0;
    }
  }

  .modal-body {
    @apply bg-white rounded-lg overflow-hidden shadow-xl transform;
    @apply transition-all w-full;

    @screen sm {
      @apply inline-block;
    }
  }

  .modal-actions {
    @apply bg-gray-50 px-4 py-3;

    @screen sm {
      @apply px-6 flex flex-row-reverse;
    }
  }

  .modal-slide-enter-active {
    @apply ease-out duration-300;
  }

  .modal-slide-leave-active {
    @apply ease-out duration-200;
  }

  .modal-slide-enter,
  .modal-slide-leave-to {
    @apply opacity-0 translate-y-4;

    @screen sm {
      @apply translate-y-0 scale-95;
    }
  }

  .modal-slide-enter-to,
  .modal-slide-leave {
    @apply opacity-100 translate-y-0;

    @screen sm {
      @apply scale-100;
    }
  }

  .overlay-fade-enter-active,
  .overlay-fade-leave-active {
    @apply ease-out duration-200;
  }

  .overlay-fade-leave-active {
    @apply ease-out duration-200;
  }

  .overlay-fade-enter,
  .overlay-fade-leave-to {
    @apply opacity-0;
  }

  .overlay-fade-enter-to,
  .overlay-fade-leave {
    @apply opacity-100;
  }
</style>
