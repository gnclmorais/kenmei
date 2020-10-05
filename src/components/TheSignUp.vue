<template lang="pug">
  .w-full
    template(v-if="confirmationInitiated")
      base-action-completed(
        header="Signed up successfully"
        text="Check your inbox for instructions from us on how to verify your account"
        buttonText="Close"
        @completeAction="$emit('signOnFinished')"
      )
    form(v-else @submit.prevent="signUp")
      base-form-input(
        v-model.trim="$v.user.email.$model"
        :validator="$v.user.email"
        label="Email"
        placeholder="you@example.com"
      )
      base-form-input.mt-5(
        v-model.trim="$v.user.password.$model"
        :validator="$v.user.password"
        label="Password"
        placeholder="Password"
        type="password"
      )
      base-form-input.mt-5(
        v-model.trim="$v.user.password_confirmation.$model"
        :validator="$v.user.password_confirmation"
        label="Password confirmation"
        placeholder="Password confirmation"
        type="password"
      )
      base-button.mt-5(ref='signUpSubmit' type='submit') Register
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
  import {
    required, email, minLength, maxLength, sameAs,
  } from 'vuelidate/lib/validators';
  import { Message, Divider, Link } from 'element-ui';

  import { create } from '@/services/endpoints/auth/registrations';

  export default {
    components: {
      'el-divider': Divider,
      'el-link': Link,
    },
    data() {
      return {
        confirmationInitiated: false,
        user: {
          email: '',
          password: '',
          password_confirmation: '',
        },
      };
    },
    validations: {
      user: {
        email: {
          required,
          email,
        },
        password: {
          required,
          minLength8: minLength(8),
          maxLength24: maxLength(24),
        },
        password_confirmation: {
          sameAs: sameAs('password'),
        },
      },
    },
    methods: {
      async signUp() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        this.$emit('loading', true);

        const response = await create(this.user);

        if (response.status === 200) {
          this.confirmationInitiated = true;
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
