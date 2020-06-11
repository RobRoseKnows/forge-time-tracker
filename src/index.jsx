import ForgeUI, { render, Text, IssueAction, ModalDialog, useState } from '@forge/ui';

const App = () => {
  const [isOpen, setOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalDialog header="Hello" onClose={() => setOpen(false)}>
      <Text>Hello world!</Text>
    </ModalDialog>
  );
};

export const run = render(
  <IssueAction>
    <App/>
  </IssueAction>
);
