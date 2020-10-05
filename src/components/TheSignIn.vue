<template lang="pug">
  .w-full
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
    base-form-checkbox.mt-5(v-model="user.remember_me") Remember Me (2 months)
    base-button.mt-5(ref='signInSubmit' @click='submitForm') Sign In
    .text-center
      el-link.mt-4(
        @click.native="$emit('componentChanged', 'TheResetPassword')"
        :underline="false"
      )
        | Forgot your password?
      el-divider.my-4
      span.text-sm
        | Don't have an account?
        |
      el-link.align-baseline(
        @click.native="$emit('componentChanged', 'TheSignUp')"
        :underline="false"
      )
        | Register
</template>

<script>
  import { required, email } from 'vuelidate/lib/validators';
  import { mapActions, mapGetters } from 'vuex';
  import { Checkbox, Link, Divider } from 'element-ui';

  export default {
    components: {
      'el-checkbox': Checkbox,
      'el-link': Link,
      'el-divider': Divider,
    },
    data() {
      return {
        user: {
          email: '',
          password: '',
          remember_me: false,
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
        },
      },
    },
    computed: {
      ...mapGetters('user', [
        'signedIn',
      ]),
    },
    methods: {
      ...mapActions('user', [
        'signIn',
      ]),
      async submitForm() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        this.$emit('loading', true);

        await this.signIn(this.user);
        if (this.signedIn) {
          this.$emit('signOnFinished');
          this.$router.push({ name: 'manga-list' });
        }

        this.$emit('loading', false);
      },
    },
  };
</script>
