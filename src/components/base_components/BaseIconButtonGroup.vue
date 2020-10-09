<template lang="pug">
  span.relative.z-0.inline-flex.shadow-md.rounded-md
    button.group(
      type='button'
      v-for="(button, index) in buttons"
      :key="index"
      :class="buttonClasses(button, index)"
      @click="$emit('click', button.text)"
    )
      component.h-5.w-5(:is="button.icon")
</template>

<script>
  export default {
    props: {
      buttons: {
        type: Array,
        required: true,
        validator: (prop) => prop.length >= 2,
      },
    },
    methods: {
      buttonClasses(button, index) {
        return {
          'hover_text-gray-800': button.colour === 'primary',
          'hover_text-green-400': button.colour === 'success',
          'hover_text-red-400': button.colour === 'danger',
          'rounded-l-md': index === 0,
          '-ml-px': index > 0,
          'rounded-r-md': index === this.buttons.length - 1,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  button {
    @apply relative inline-flex items-center px-2 py-1 text-gray-500;
    @apply border border-gray-300 bg-white text-sm leading-5 font-medium;
    @apply transition ease-in-out duration-150;

    &:focus {
      @apply z-10 outline-none;
    }

    &:active {
      @apply bg-gray-100 text-gray-500;
    }
  }
</style>
