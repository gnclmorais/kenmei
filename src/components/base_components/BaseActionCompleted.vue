<template lang="pug">
  .w-full#action-completed
    div
      .icon(:class="classes")
        component.h-6.w-6(:is="iconName")
      .mt-3.text-center.sm_mt-5
        h3.text-lg.leading-6.font-medium.text-gray-900(v-text="header")
        .mt-2
          p.text-sm.leading-5.text-gray-500(v-text="text")
    .mt-5.sm_mt-6
      span.flex.w-full.rounded-md.shadow-sm
        base-button(@click="$emit('completeAction')")
          | {{ this.buttonText }}
</template>

<script>
  export default {
    props: {
      header: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: 'success',
      },
      text: {
        type: String,
        required: true,
      },
      buttonText: {
        type: String,
        required: true,
      },
    },
    computed: {
      classes() {
        return {
          'bg-green-100 text-green-600': this.type === 'success',
          'bg-red-100 text-red-600': this.type === 'danger',
        };
      },
      iconName() {
        return {
          success: 'icon-check',
          danger: 'icon-warning',
        }[this.type];
      },
    },
  };
</script>

<style media="screen" lang="scss" scoped>
  .icon {
    @apply mx-auto flex items-center justify-center h-12 w-12 rounded-full;
  }
</style>
