<template lang="pug">
  span.relative.z-0.inline-flex.shadow-sm
    button(
      v-for='(button, i) in buttons'
      v-text='button.text'
      @click="$emit('click')"
      :key="i"
      :class="{ 'rounded-l-md': i === 0, '-ml-px': i !== 0, 'rounded-r-md': i == buttons.length - 1 }"
    )
</template>

<script>
  export default {
    props: {
      buttons: {
        type: Array,
        required: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  @tailwind base;

  button {
    @apply relative inline-flex items-center px-4 py-2 border border-gray-300;
    @apply bg-white text-sm leading-5 font-medium text-gray-700;
    @apply transition ease-in-out duration-150;

    &:hover {
      @apply text-gray-500;
    }

    &:focus {
      @apply z-10 outline-none border-blue-300 shadow-outline-blue;
    }

    &:active {
      @apply bg-gray-100 text-gray-700;
    }
  }
</style>
