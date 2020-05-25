import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import '@/stylesheets/tailwind.css';
import '@/stylesheets/global.scss';
import '@/stylesheets/transitions.scss';

import BaseButton from '@/components/base_components/BaseButton.vue';

export default {
  component: BaseButton,
  title: 'Button',
};

export const withText = () => ({
  components: { BaseButton },
  template: `
    <div class="mx-5 my-5">
      <h2 class="my-2">Regular</h2>
      <div class="flex w-64 space-x-3">
        <base-button>Primary</base-button>
        <base-button type="success">Success</base-button>
        <base-button type="secondary">Secondary</base-button>
        <base-button type="info">Info</base-button>
        <base-button type="warning">Warning</base-button>
        <base-button type="danger">Danger</base-button>
      </div>
      <h2 class="my-2">Disabled</h2>
      <div class="flex w-64 space-x-3">
        <base-button disabled>Primary</base-button>
        <base-button type="success" disabled>Success</base-button>
        <base-button type="secondary" disabled>Secondary</base-button>
        <base-button type="info" disabled>Info</base-button>
        <base-button type="warning" disabled>Warning</base-button>
        <base-button type="danger" disabled>Danger</base-button>
      </div>
    </div>
  `,
});
