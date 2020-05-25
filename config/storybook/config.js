// On the line that imports from @storybook/vue, add getStorybook and setAddon
import { configure, getStorybook, setAddon } from '@storybook/vue';
import createPercyAddon from '@percy-io/percy-storybook';

const { percyAddon, serializeStories } = createPercyAddon();

setAddon(percyAddon);
serializeStories(getStorybook);
