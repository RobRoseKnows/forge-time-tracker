import ForgeUI, { render, Text, IssuePanel, Fragment, useState } from '@forge/ui';

const App = () => {
  return (
    <Fragment>
      <Text>Hello world!</Text>
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App/>
  </IssuePanel>
);
