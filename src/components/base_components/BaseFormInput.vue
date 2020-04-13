<template lang="pug">
  .w-full
    label.block.text-sm.font-medium.leading-5.text-gray-700(v-if="label")
      | {{ label }}
      transition(
        enter-active-class='slide-transition'
        enter-class='opacity-0 transform -translate-y-1'
        leave-active-class='slide-transition'
        leave-to-class='opacity-0 transform -translate-y-1'
      )
        span.leading-none.ml-1.text-xs.text-red-600(
          v-if="hasErrors"
          v-t.preserve="activeError"
        )
    .relative.rounded-md.shadow-sm(:class="{ 'mt-1': label }")
      .icon.text-gray-400(
        v-if="$slots.icon"
        :class="{ 'text-red-300': hasErrors }"
      )
        slot(name="icon")
      input.form-input.block.w-full.sm_text-sm.sm_leading-5(
        v-bind:value="value"
        v-on:input="$emit('input', $event.target.value)"
        :class="classes"
        :placeholder="placeholder"
        :type="type"
      )
    p.mt-2.text-xs.text-gray-500(v-if="helperText" v-text="helperText")
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: '',
      },
      label: {
        type: String,
        default: null,
      },
      placeholder: {
        type: String,
        default: null,
      },
      helperText: {
        type: String,
        default: null,
      },
      validator: {
        type: Object,
        default: null,
      },
    },
    computed: {
      hasErrors() {
        return this.validator && this.validator.$error;
      },
      errors() {
        if (!this.validator) { return []; }

        return Object.keys(this.validator.$params);
      },
      activeError() {
        if (!this.validator) { return null; }

        const error = this.errors.find((error) => !this.validator[error]);

        return `errors.${error}`;
      },
      classes() {
        return {
          'pl-10': this.$slots.icon,
          'error placeholder-red-300': this.hasErrors,
        };
      },
    },
  };
</script>

<style media="screen" lang="scss" scoped>
  .slide-transition {
    @apply transition ease-in duration-200 transition-all overflow-hidden;
  }

  .icon {
    @apply absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none;
  }
  .error {
    @apply border-red-300 text-red-900 pr-10;

    &:focus {
      @apply border-red-300 shadow-outline-red;
    }
  }
</style>
