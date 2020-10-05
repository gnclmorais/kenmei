<template lang="pug">
  base-modal(:visible="visible" size="lg" @dialogClosed="$emit('dialogClosed')")
    template(slot='body')
      .warning-icon
        icon-warning.h-6.w-6.text-red-600.stroke-current
      .mt-3.text-center.sm_mt-0.sm_ml-4.sm_text-left
        h3.text-lg.leading-6.font-medium.text-gray-900
          | Multiple sites tracked
        .mt-2
          p.text-sm.leading-5.text-gray-500
            | Some entries have multiple sites being tracked.
            | If you want to delete them all, please proceed. Otherwise,
            | use the edit button to switch to a different source.
    template(slot='actions')
      span.flex.w-full.rounded-md.shadow-sm.sm_ml-3.sm_w-auto
        base-button(colour="danger" @click="$emit('confirmDeletion')")
          | Delete
      span.mt-3.flex.w-full.rounded-md.shadow-sm.sm_mt-0.sm_w-auto
        base-button(colour="secondary" @click="$emit('dialogClosed')")
          | Cancel
</template>

<script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style lang="scss" media="screen" scoped>
  .warning-icon {
    @apply mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12;
    @apply rounded-full bg-red-100;

    @screen sm {
      @apply mx-0 h-10 w-10;
    }
  }
</style>
