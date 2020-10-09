<template lang="pug">
  .ml-4.mt-2.flex-shrink-0
    transition(
      enter-active-class='slide-transition'
      enter-class='opacity-0 transform translate-x-8'
      leave-active-class='slide-transition'
      leave-to-class='opacity-0 transform translate-x-8'
      mode="out-in"
    )
      div(key="bulk" v-if="editMode")
        bulk-actions.hidden.mb-3.sm_flex.sm_mb-0(
          @delete="$emit('bulkDelete', 'bulkDelete')"
          @edit="$emit('bulkEdit', 'bulkEdit')"
          @read="$emit('bulkUpdate', 'bulkUpdate')"
          @report="$emit('bulkReport', 'bulkReport')"
        )
        .block.sm_hidden
          base-fab.ml-3.fixed.bottom-15.right-5.z-50(
            @click="$emit('bulkEdit', 'bulkEdit')"
          )
            icon-edit-filled.w-6.h-6.inline-block.text-white.ml-1
      div(key="actions" v-else)
        .hidden.sm_block
          span.inline-flex.rounded-md.shadow-sm
            base-button(
              colour="success"
              @click="$emit('importManga', 'importManga')"
            )
              i.el-icon-upload2.mr-1
              | Import
          span.ml-3.inline-flex.rounded-md.shadow-sm
            base-button(
              ref="addMangaEntryModalButton"
              @click="$emit('addManga', 'addManga')"
            )
              i.el-icon-plus.mr-1
              | Add Manga
        .block.sm_hidden
          base-fab.ml-3.fixed.bottom-15.right-5.z-50(
            @click="$emit('addManga', 'addManga')"
          )
            icon-plus.w-6.h-6.inline-block.text-white
</template>

<script>
  import BulkActions from '@/components/BulkActions';

  export default {
    components: {
      BulkActions,
    },
    props: {
      editMode: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .btn-group {
    &:hover {
      @apply text-gray-500;
    }
    &:focus {
      @apply z-10 outline-none border-blue-300 shadow-outline-blue;
    }
    &:active {
      @apply text-gray-700;
    }
  }

  .slide-transition {
    @apply transition ease-in duration-300 transition-all overflow-hidden;
  }
</style>
