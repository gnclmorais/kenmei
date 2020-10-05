<template lang="pug">
  .w-full
    template(v-if="resetInitiated")
      base-action-completed(
        header="Password reset completed"
        text="Check your inbox for instructions from us on how to reset your password"
        buttonText="Close"
        @completeAction="$emit('signOnFinished')"
      )
    form(v-else @submit.prevent="resetPassword")
      base-form-input(
        v-model.trim="$v.user.email.$model"
        :validator="$v.user.email"
        label="Email"
        placeholder="you@example.com"
        helperText="Enter your email address and we'll send you a link to reset your password."
        @keyup.enter.native='resetPassword'
      )
        template(slot='icon')
          icon-mail.h-5.w-5
      base-button.mt-5(ref='resetPasswordSubmit' type='submit')
        | Reset Password
      .text-center
        el-divider.my-4
        span.text-sm
          | Already have an account?
          |
        el-link.align-baseline(
          @click.native="$emit('componentChanged', 'TheSignIn')"
          :underline="false"
        )
          | Sign In
</template>

<script>
  import { required, email } from 'vuelidate/lib/validators';
  import { Link, Message, Divider } from 'element-ui';

  import { plain } from '@/modules/axios';

  export default {
    components: {
      'el-link': Link,
      'el-divider': Divider,
    },
    data() {
      return {
        user: {
          email: '',
        },
        resetInitiated: false,
      };
    },
    validations: {
      user: {
        email: {
          required,
          email,
        },
      },
    },
    methods: {
      async resetPassword() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        this.$emit('loading', true);

        const response = await plain
          .post('/auth/passwords', { email: this.user.email })
          .catch((e) => e.response);

        if (response.status === 200) {
          this.resetInitiated = true;
        } else {
          Message.error({
            dangerouslyUseHTMLString: true,
            message: response.data,
          });
        }

        this.$emit('loading', false);
      },
    },
  };
</script>
