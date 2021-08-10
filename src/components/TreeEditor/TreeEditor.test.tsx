import React from 'react';
import * as ReactRedux from 'react-redux';
import { treeData } from '__mocks__/treeData';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import store from 'store/initStore';

import TreeEditor from './TreeEditor';

function renderComponent(): RenderResult {
  return render(
    <ReactRedux.Provider store={store}>
      <TreeEditor isOpen rows={treeData.rows} columns={treeData.columns} />
    </ReactRedux.Provider>,
  );
}

describe('treeTable', () => {
  const useDispatchMock = jest.spyOn(ReactRedux, 'useDispatch');
  const useSelectorMock = jest.spyOn(ReactRedux, 'useSelector');
  beforeEach(() => {
    useDispatchMock.mockClear();
    useSelectorMock.mockClear();
    const dispatch = jest.fn();
    useDispatchMock.mockReturnValue(dispatch);
    const spy = jest.spyOn(ReactRedux, 'useSelector');
    spy.mockReturnValue('Test project Resource Base');
  });

  test('render without exception', () => {
    renderComponent();
  });

  test('The table is filtered after clicking on the list item', () => {
    renderComponent();
    const items = screen.getAllByRole('treeitem');
    userEvent.click(items[0]);
  });
});
