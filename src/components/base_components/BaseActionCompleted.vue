<template lang="pug">
  #action-completed
    div
      .mx-auto.flex.items-center.justify-center.h-12.w-12.rounded-full.bg-green-100
        svg.h-6.w-6.text-green-600.stroke-current(
          fill='none'
          viewbox='0 0 24 24'
        )
          path(
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2' d='M5 13l4 4L19 7'
          )
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
      text: {
        type: String,
        required: true,
      },
      buttonText: {
        type: String,
        required: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  @tailwind base;
</style>
