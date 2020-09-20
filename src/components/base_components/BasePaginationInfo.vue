<template lang="pug">
  div
    .animate-pulse.flex.space-x-4.w-48(v-if="loading")
      .flex-1.space-y-4.py-1
        .h-3.bg-gray-400.rounded
    p.text-sm.leading-5.text-gray-700(v-else)
      | Showing
      span.font-medium.px-1(v-text="pagy.from")
      | to
      span.font-medium.px-1(v-text="pagy.to")
      | of
      span.font-medium.pl-1(v-text="pagy.count + ' results'")
</template>

<script>
  export default {
    props: {
      pagy: {
        type: Object,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>
