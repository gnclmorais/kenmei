<template lang="pug">
  .relative.bg-blue-600
    .max-w-screen-xl.mx-auto.py-3.px-3.sm_px-6.lg_px-8
      .pr-16.sm_text-center.sm_px-16
        p.font-medium.text-white
          span.md_hidden(v-text="mobileText")
          span.hidden.md_inline(v-text="text")
          span.block.sm_ml-2.sm_inline-block(v-if="link")
            a.text-white.font-bold.hover_underline(:href='link' target="_blank")
              | Learn more &rarr;
      .dismiss-button
        button(type='button' aria-label='Dismiss' @click="$emit('close')")
          svg.h-6.w-6.text-white(
            stroke='currentColor'
            fill='none'
            viewbox='0 0 24 24'
          )
            path(
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M6 18L18 6M6 6l12 12'
            )
</template>

<script>
  export default {
    props: {
      text: {
        type: String,
        required: true,
      },
      mobileText: {
        type: String,
        default: 'New update released!',
      },
      link: {
        type: String,
        default: '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .fade-out-up-leave-active {
    @apply transition ease-in duration-300 transition-all overflow-hidden;
  }

  .fade-out-up-leave-active { @apply opacity-0 transform -translate-y-8;}

  button {
    @apply flex p-2 rounded-md transition ease-in-out duration-150;

    &:hover {
      @apply bg-blue-500;
    }

    &:focus {
      @apply outline-none bg-blue-500;
    }
  }

  .dismiss-button {
    @apply absolute inset-y-0 right-0 pt-1 pr-1 flex items-start;

    @screen sm {
      @apply pt-1 pr-2 items-start;
    }
  }
</style>
