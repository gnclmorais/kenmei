<template lang="pug">
  .relative.flex.items-start
    .absolute.flex.items-center.h-5
      input.form-checkbox#checkbox(
        type='checkbox'
        :checked="value"
        :indeterminate.prop="indeterminate"
        :disabled="disabled"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @change="$emit('input', $event.target.checked)"
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
      indeterminate: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
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

    &:indeterminate {
      @apply border-transparent bg-no-repeat bg-center;

      background: url("data:image/svg+xml,%3Csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'8\' height=\'2\' x=\'4\' y=\'7\' rx=\'1\'/%3E%3C/svg%3E");
      background-color: currentColor;
      background-size: 100% 100%;
    }
  }
</style>
