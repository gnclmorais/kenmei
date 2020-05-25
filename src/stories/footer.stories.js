import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import BaseFooter from '@/components/base_components/BaseFooter.vue';

export default {
  component: BaseFooter,
  title: 'Footer',
};


export const light = () => ({
  components: { BaseFooter },
  template: `
    <div class="flex flex-col h-screen w-full items-center justify-center bg-gray-100">
      <div class="py-8 px-10 w-full h-full">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-full"></div>
      </div>
      <base-footer class="w-full"></base-footer>
    </div>
  `,
});

export const dark = () => ({
  components: { BaseFooter },
  template: `
    <div class="flex flex-col h-screen w-full items-center justify-center bg-gray-100">
      <div class="py-8 px-10 w-full h-full">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-full"></div>
      </div>
      <base-footer class="w-full" dark></base-footer>
    </div>
  `,
});
