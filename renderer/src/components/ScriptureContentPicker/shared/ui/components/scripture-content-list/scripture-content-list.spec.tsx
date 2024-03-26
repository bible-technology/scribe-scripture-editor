import { render } from '@testing-library/react';

import ScriptureContentList from './scripture-content-list';

describe('SharedUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ScriptureContentList group={{}} />
    );
    expect(baseElement).toBeTruthy();
  });
});
