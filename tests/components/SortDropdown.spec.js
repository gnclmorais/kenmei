import SortDropdown from '@/components/SortDropdown.vue';

describe('SortDropdown.vue', () => {
  let sortDropdown;

  beforeEach(() => {
    sortDropdown = shallowMount(SortDropdown, {
      data() { return { open: true }; },
    });
  });

  describe('when pressing Esc', () => {
    it('closes dropdown', async () => {
      await sortDropdown.trigger('keydown.esc');

      expect(sortDropdown.vm.$open).toBeFalsy();
    });
  });

  describe('when pressing off dropdown', () => {
    it('closes dropdown', async () => {
      await sortDropdown
        .findComponent({ ref: 'clickOffButton' })
        .trigger('click');

      expect(sortDropdown.vm.$open).toBeFalsy();
    });
  });

  describe('when pressing on the dropdown option', () => {
    beforeEach(() => {
      expect(sortDropdown.vm.$data.selectedSort).toEqual('Unread');
      expect(sortDropdown.vm.$data.sortDirection).toEqual('desc');
    });

    afterEach(() => {
      expect(sortDropdown.vm.$data.open).toBeFalsy();
    });

    describe('and selected option is the same as before', () => {
      it('emits sort option with sorting direction reversed', async () => {
        await sortDropdown.findAll('a').at(0).trigger('click');

        expect(sortDropdown.emitted('click')[0]).toEqual([{ Unread: 'asc' }]);
      });
    });

    describe('and selected option is new', () => {
      it('emits sort option with descending sorting direction', async () => {
        await sortDropdown.findAll('a').at(1).trigger('click');

        expect(sortDropdown.emitted('click')[0]).toEqual([{ Title: 'desc' }]);

        await sortDropdown.findAll('a').at(2).trigger('click');

        expect(sortDropdown.emitted('click')[1]).toEqual([{ Released: 'desc' }]);
      });
    });
  });
});
