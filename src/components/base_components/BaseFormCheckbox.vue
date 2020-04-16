<template lang="pug">
  .relative.flex.items-start
    .absolute.flex.items-center.h-5
      input.form-checkbox#checkbox(
        type='checkbox'
        v-bind:checked="value"
        v-on:input="$emit('input', $event.target.checked)"
      )
    .pl-7.text-sm.leading-5(v-if='$slots.default')
      label.font-medium.text-gray-700(for="checkbox")
        slot
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        required: true,
      },
      label: {
        type: String,
        default: null,
      },
    },
  };
</script>

<style lang="scss" scoped>
  input {
    @apply h-4 w-4 text-blue-600 transition duration-150 ease-in-out;
  }
</style>
