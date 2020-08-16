// Globally register all base components and icons for convenience, because they
// will be used very frequently. Components are registered using the
// PascalCased version of their file name.
import Vue from 'vue';

// https://webpack.js.org/guides/dependency-management/#require-context
const icons = require.context('./icons', false, /Icon[A-Z]\w+\.vue$/);
const requireComponent = require.context(
  './base_components',
  true,
  /Base[A-Z]\w+\.(vue|js)$/,
);

// Register all base components
requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName);
  const componentName   = fileName.replace(/^\.\//, '').replace(/\.\w+$/, '');

  Vue.component(componentName, componentConfig.default || componentConfig);
});

// Register all icons
icons.keys().forEach((fileName) => {
  const componentConfig = icons(fileName);
  const componentName   = fileName.replace(/^\.\//, '').replace(/\.\w+$/, '');

  Vue.component(componentName, componentConfig.default || componentConfig);
});
