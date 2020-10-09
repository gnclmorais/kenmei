<template lang="pug">
  span.inline-flex.rounded-full.shadow-md
    button.mouse.ripple(@click="$emit('click')")
      slot
</template>

<style lang="scss" scoped>
  button {
    -webkit-tap-highlight-color: transparent;
    
    @apply p-0 w-14 h-14 bg-blue-600 rounded-full shadow-md;
    @apply transition ease-in duration-200;

    &:active {
      @apply shadow-lg;
    }

    &:focus {
      @apply outline-none;
    }
  }

  // Ripple click event
  .ripple {
    @apply relative overflow-hidden;

    transform: translate3d(0, 0, 0);
  }

  .ripple:after {
    @apply block absolute w-full h-full left-0 top-0 pointer-events-none;
    @apply opacity-0 bg-no-repeat;

    content: "";
    background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
    background-position: 50%;
    transform: scale(10, 10);
    transition: transform .3s, opacity 1s;
  }

  .ripple:active:after {
    transform: scale(0, 0);
    opacity: .3;
    transition: 0s;
  }
</style>
