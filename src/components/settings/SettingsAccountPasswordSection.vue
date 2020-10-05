<template lang="pug">
  .bg-white.shadow.px-4.py-5.rounded-lg.sm_p-6(v-loading="loading")
    .md_grid.md_grid-cols-3.md_gap-6
      .md_col-span-1
        h3.text-lg.font-medium.leading-6.text-gray-900 Password
        p.mt-1.text-sm.leading-5.text-gray-500
          | Current password is required, if you want to set a new password.
      .mt-5.md_mt-0.md_col-span-2
        .grid.grid-cols-6.gap-6
          .col-span-6.sm_col-span-3
            base-form-input(
              v-model.trim="$v.user.password.$model"
              :validator="$v.user.password"
              label="New password"
              autocomplete='new-password'
              type="password"
            )
          .col-span-6.sm_col-span-3
            base-form-input(
              v-model.trim="$v.user.passwordConfirmation.$model"
              :validator="$v.user.passwordConfirmation"
              label="Confirm new password"
              autocomplete='new-password'
              type="password"
            )
          .col-span-6.sm_col-span-3
            base-form-input(
              v-model.trim="$v.user.currentPassword.$model"
              :validator="$v.user.currentPassword"
              label="Current password"
              type="password"
              autocomplete="current-password"
            )
      .mt-8.border-t.border-gray-200.pt-5.col-span-3
        .flex.justify-end
          span.inline-flex.rounded-md.shadow-sm
            base-button(@click='updatePassword') Save
</template>

<script>
  import {
    required, minLength, maxLength, sameAs,
  } from 'vuelidate/lib/validators';
  import { Message } from 'element-ui';

  import { update } from '@/services/endpoints/auth/passwords';

  export default {
    data() {
      return {
        user: {
          password: '',
          passwordConfirmation: '',
          currentPassword: '',
        },
        loading: false,
      };
    },
    validations: {
      user: {
        password: {
          required,
          minLength8: minLength(8),
          maxLength24: maxLength(24),
        },
        passwordConfirmation: {
          sameAs: sameAs('password'),
        },
        currentPassword: {
          required,
        },
      },
    },
    methods: {
      async updatePassword() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        this.loading = true;

        const response = await update(this.user);

        if (response.status === 200) {
          Message.success('Password updated');
        } else {
          Message.error({
            dangerouslyUseHTMLString: true,
            message: response.data,
          });
        }

        this.loading = false;
      },
    },
  };
</script>
