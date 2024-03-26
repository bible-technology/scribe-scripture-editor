import { render } from '@testing-library/react';

import ScriptureContentTypeMenu from './scripture-content-type-menu';

describe('SharedUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ScriptureContentTypeMenu items={[]} onSelectMenuItem={() => {}} />
    );
    expect(baseElement).toBeTruthy();
  });
});
