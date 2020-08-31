import BulkActions from '@/components/BulkActions.vue';

describe('BulkActions.vue', () => {
  it('renders renders bulk actions button group', () => {
    const bulkActions = shallowMount(BulkActions);

    expect(bulkActions.html()).toMatchSnapshot();
  });

  describe('when pressing a button', () => {
    it('emits associated action', async () => {
      const bulkActions = shallowMount(BulkActions);

      await bulkActions.findAll('button').at(0).trigger('click');
      expect(bulkActions.emitted('delete')).toBeTruthy();

      await bulkActions.findAll('button').at(1).trigger('click');
      expect(bulkActions.emitted('edit')).toBeTruthy();

      await bulkActions.findAll('button').at(2).trigger('click');
      expect(bulkActions.emitted('read')).toBeTruthy();

      await bulkActions.findAll('button').at(3).trigger('click');
      expect(bulkActions.emitted('report')).toBeTruthy();
    });
  });
});
