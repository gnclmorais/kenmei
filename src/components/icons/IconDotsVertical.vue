<template lang="pug">
  svg(fill='currentColor' viewbox='0 0 20 20')
    path(:d='d')
</template>

<script>
  export default {
    data() {
      return {
        d: `
          M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2
          2 0 110-4 2 2 0 010 4z
        `,
      };
    },
  };
</script>
