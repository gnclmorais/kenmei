<template lang="pug">
  .border-b.border-gray-200
    nav.-mb-px.flex
      a(
        href='#'
        v-for="tab in tabs"
        v-text="tab"
        :class="classes(tab)"
        @click.prevent="$emit('tabSelected', tab)"
      )
</template>

<script>
  export default {
    props: {
      tabs: {
        type: Array,
        required: true,
      },
      selectedTab: {
        type: String,
        default: '',
      },
    },
    methods: {
      classes(tab) {
        return {
          'active-tab': tab === this.selectedTab,
          tab: tab !== this.selectedTab,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  a {
    @apply py-3 px-1 text-center border-b-2 font-medium text-sm leading-5 w-2/4;
  }

  .tab {
    @apply border-transparent text-gray-500;

    &:hover {
      @apply text-gray-700 border-gray-300;
    }
  }

  .active-tab {
    @apply border-blue-500 text-blue-600;
  }
</style>
