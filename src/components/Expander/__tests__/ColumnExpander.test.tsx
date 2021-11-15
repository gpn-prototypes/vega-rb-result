import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { TableMock } from '@app/__tests__/Table.mock';
import store from '@app/store/initStore';
import { TableActions } from '@app/store/table/tableActions';
import { GridCollection } from '@app/types/typesTable';
import { fireEvent } from '@testing-library/dom';
import { act, render, RenderResult, screen } from '@testing-library/react';

import { ColumnExpanderComponent } from '../ColumnExpanderComponent';

const renderComponent = (): RenderResult => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ColumnExpanderComponent
          column={TableMock.ColumnExpanderMock.columns[0]}
        />
      </BrowserRouter>
    </Provider>,
  );
};

describe('ColumnExpander', () => {
  beforeAll(() => {
    const mockGridState: GridCollection = TableMock.ColumnExpanderMock;

    store.dispatch(TableActions.initState(mockGridState));
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    await act(async () => {
      renderComponent();
    });
  });

  test('Ожидаем, что по умолчанию у нас показывается иконка скрытия(минус)', async () => {
    expect(
      screen.getByRole('button').getElementsByClassName('IconRemove'),
    ).toBeTruthy();
  });

  test('Ожидаем, что при клике, у нас смениться иконка на показ(плюс)', async () => {
    expect(
      screen.getByRole('button').getElementsByClassName('IconRemove'),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(
      screen.getByRole('button').getElementsByClassName('IconAdd'),
    ).toBeTruthy();
  });
});
