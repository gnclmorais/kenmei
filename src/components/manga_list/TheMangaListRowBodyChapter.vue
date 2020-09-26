<template lang="pug">
  a(:href='url' target='_blank')
    base-badge.hover_bg-blue-200.hover_text-blue-700(v-text="chapterInfo")
</template>

<script>
  export default {
    props: {
      chapter: {
        type: String,
        default: '',
      },
      volume: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '#',
      },
    },
    computed: {
      chapterInfo() {
        if (this.chapter) {
          const chapterNumber = parseFloat(this.chapter);

          if (this.volume && this.volume !== '0') {
            return `Vol. ${this.volume} Ch. ${this.chapter}`;
          }

          // TODO: Replace when we return titles separately from the chapter
          if (Number.isNaN(chapterNumber)) return this.chapter;

          return `Ch. ${this.chapter}`;
        }

        return '';
      },
    },
  };
</script>

<style lang="css" scoped>
</style>
