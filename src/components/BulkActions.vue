<template lang="pug">
  transition(
    enter-active-class='slide-transition'
    enter-class='opacity-0 transform translate-y-8'
    leave-active-class='slide-transition'
    leave-to-class='opacity-0 transform translate-y-8'
  )
    span.relative.z-0.inline-flex.shadow-sm
      button.w-full.flex.justify-center.group(
        v-for='(button, index) in buttons'
        @click="$emit(button.action)"
        :key="index"
        :class="buttonClasses(index)"
      )
        component.-ml-1.mr-2.h-5.w-5.text-gray-400(
          :is='button.icon'
          :class="hoverClasses(button.action)"
        )
        span(
          v-text="button.text"
          :class="hoverClasses(button.action)"
        )
</template>

<script>
  export default {
    data() {
      return {
        buttons: [
          {
            text: 'Delete',
            action: 'delete',
            icon: 'IconTrash',
          },
          {
            text: 'Edit',
            action: 'edit',
            icon: 'IconEdit',
          },
          {
            text: 'Report',
            action: 'report',
            icon: 'IconWarning',
          },

        ],
      };
    },
    methods: {
      buttonClasses(index) {
        return {
          'rounded-l-md': index === 0,
          '-ml-px': index !== 0,
          'rounded-r-md': index === this.buttons.length - 1,
        };
      },
      hoverClasses(action) {
        return {
          'group-hover_text-red-400': action === 'delete',
          'group-hover_text-gray-800': action === 'edit',
          'group-hover_text-yellow-400': action === 'report',
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  button {
    @apply relative inline-flex items-center px-4 py-2 border border-gray-300;
    @apply bg-white text-sm leading-5 font-medium text-gray-700;
    @apply transition ease-in-out duration-150;

    &:hover {
      @apply text-gray-500;
    }

    &:focus {
      @apply z-10 outline-none border-gray-300 shadow-none;
    }

    &:active {
      @apply bg-gray-100 text-gray-700;
    }
  }

  .slide-transition {
    @apply transition ease-in duration-300 transition-all overflow-hidden;
  }
</style>
