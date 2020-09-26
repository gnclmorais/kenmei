<template lang="pug">
  .min-w-0.flex-1.md_grid.md_grid-cols-3.md_gap-4
    .animate-pulse.flex.space-x-4
      .flex-1.space-y-4.py-1
        .h-3.bg-gray-400.rounded(class='w-3/4')
        .space-y-2
          .h-3.bg-gray-400.rounded(class='w-2/6')
    .animate-pulse.flex.space-x-4(v-for="index in 2" :key="index")
      .flex-1.space-y-4.py-1
        .h-3.bg-gray-400.rounded(class='w-2/4')
        .space-y-2
          .h-3.bg-gray-400.rounded(class='w-2/6')
</template>
