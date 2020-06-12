<template lang="pug">
  .bg-white.rounded-lg.shadow(v-loading="tagsLoading")
    .bg-white.px-4.py-5.border-b.border-gray-200.sm_px-6.rounded-t-lg
      .-ml-4.-mt-2.flex.items-center.justify-between.flex-wrap.sm_flex-no-wrap
        .ml-4.mt-2
          h3.text-lg.leading-6.font-medium.text-gray-900
            | Tags
        .ml-4.mt-2.flex-shrink-0
          span.inline-flex.rounded-md.shadow-sm
            base-button(ref="openTagCreationModal" @click="modalVisible = true")
              | Add
    ul
      template(v-if="tags.length")
        li.flex.items-center.px-4.py-4.sm_px-6(
          v-for="(tag, index) in currentPageTags"
          :key="tag.id"
          :class="{ 'border-t border-gray-200': index !== 0 }"
        )
          .min-w-0.flex-1.flex.items-center
            .min-w-0.flex-1.items-center.grid.grid-col-1.space-y-4.sm_space-y-0.sm_grid-cols-4.sm_gap-4
              div.col-span-1
                base-badge.float-left(:text="tag.name")
              .col-span-2.text-sm.leading-5.text-gray-500
                span(v-if="tag.description" v-text="tag.description")
                span(v-else) No description
              .col-span-1.text-sm.leading-5.text-gray-500
                span.font-bold(v-text="tag.entryCount")
                |  manga entries
          base-dropdown(
            :items="dropdownItems"
            size="lg"
            @click="handleClick($event, tag)"
          )
      template(v-else)
        li.flex.justify-center.px-4.py-4.sm_px-6
          span.text-gray-500
            | No tags added yet
    nav.px-4.py-3.flex.items-center.justify-between.border-t.border-gray-200.sm_px-6(v-if="pages > 1")
      .hidden(class='sm_block')
        p.text-sm.leading-5.text-gray-700
          span.font-medium
          | Total {{ tags.length }} tags
      .flex.flex-initial.justify-between.sm_justify-end
        base-button(
          type="secondary"
          :disabled="currentPage - 1 === 0"
          @click="currentPage -= 1"
        ) Previous
        base-button.ml-3(
          type="secondary"
          :disabled="currentPage + 1 > pages"
          @click="currentPage += 1"
        ) Next
    base-modal(
      :visible="modalVisible"
      :loading="modalLoading"
      size="sm"
      @dialogClosed="closeModal()"
    )
      template(slot='body')
        .flex.flex-col.w-full
          .mt-3.text-center.sm_mt-0.sm_text-left.w-full
            label.block.text-sm.font-medium.leading-5.text-gray-700(for='name')
              | Name
            .mt-1.relative.rounded-md.shadow-sm
              input#name.form-input.block.w-full.sm_text-sm.sm_leading-5(
                aria-label='Name'
                name='name'
                v-model.trim="form.name"
                placeholder='Isekai'
                maxlength="50"
              )
          .mt-6.text-center.sm_text-left.w-full
            label.block.text-sm.font-medium.leading-5.text-gray-700(for='description')
              | Description
            .mt-1.relative.rounded-md.shadow-sm
              .max-w-lg.flex.rounded-md.shadow-sm
              input#description.form-input.block.w-full.sm_text-sm.sm_leading-5(
                aria-label='Description'
                name='description'
                v-model.trim="form.description"
                placeholder='Protagonist ends up in another world'
                maxlength="100"
              )
      template(slot='actions')
        span.flex.w-full.rounded-md.shadow-sm.sm_ml-3.sm_w-auto
          base-button(ref="addTagButton" @click="upsertTag")
            | Add
        span.mt-3.flex.w-full.rounded-md.shadow-sm.sm_mt-0.sm_w-auto
          base-button(type="secondary" @click="closeModal()") Cancel
</template>

<script>
  import { Message } from 'element-ui';

  import {
    index, create, update, destroy,
  } from '@/services/endpoints/UserTags.js';

  export default {
    data() {
      return {
        currentPage: 1,
        tagsPerPage: 5,
        tagsLoading: false,
        modalLoading: false,
        modalVisible: false,
        dropdownItems: [
          { text: 'Edit', icon: 'IconEdit' },
          { text: 'Delete', icon: 'IconTrash' },
        ],
        form: { id: null, name: '', description: '' },
        tags: [],
      };
    },
    computed: {
      pages() {
        return Math.ceil(this.tags.length / this.tagsPerPage);
      },
      currentPageTags() {
        const page = this.currentPage - 1;
        return this.tags.slice(
          page * this.tagsPerPage,
          (page + 1) * this.tagsPerPage
        );
      },
    },
    watch: {
      pages(newVal) {
        if (this.currentPage > newVal) { this.currentPage -= 1; }
      },
    },
    async created() {
      await this.getTags();
    },
    methods: {
      async getTags() {
        this.tagsLoading = true;

        const response = await index();
        const { data, status } = response;

        if (status === 200) {
          this.tags = data;
        } else {
          Message.error('Something went wrong, try refreshing the page');
        }

        this.tagsLoading = false;
      },
      async upsertTag() {
        this.modalLoading = true;

        const isUpdate = this.form.id !== null;

        const response = isUpdate
          ? await update(this.form)
          : await create(this.form);

        const { data, status } = response;

        if (status === 200) {
          if (isUpdate) {
            const index = this.tags.findIndex((t) => t.id === this.form.id);
            this.tags.splice(index, 1, data);
          } else {
            this.tags.push(data);
          }

          this.closeModal();
        } else {
          Message.error(data);
        }

        this.modalLoading = false;
      },
      async deleteTag() {
        this.tagsLoading = true;

        const response = await destroy(this.form.id);

        const { data, status } = response;

        if (status === 200) {
          this.tags = this.tags.filter((tag) => tag.id !== this.form.id);
        } else {
          Message.error(data);
        }

        this.form.id = null;
        this.tagsLoading = false;
      },
      handleClick(item, tag) {
        if (item === 'Edit') {
          this.form.id = tag.id;
          this.form.name = tag.name;
          this.form.description = tag.description;
          this.modalVisible = true;
        } else if (item === 'Delete') {
          this.form.id = tag.id;
          this.deleteTag();
        }
      },
      closeModal() {
        this.modalVisible = false;
        this.modalLoading = false;
        this.form = { id: null, name: '', description: '' };
      },
    },
  };
</script>

<style media="screen" lang="scss">
  .mobile-descriptors {
    @apply block mt-2 flex items-center text-sm leading-5;
    @apply text-gray-500;

    @screen sm {
      @apply hidden;
    }
  }
</style>
