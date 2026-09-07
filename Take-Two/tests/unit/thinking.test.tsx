import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThinkForm, thinkingFields } from '@/features/prep/think-form';
jest.mock('expo-router', () => ({ router: { canGoBack: () => false, replace: jest.fn() } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
test('all four boxes start empty and cannot submit until the user writes all four thoughts', async () => {
  const submit = jest.fn(async () => {}),
    save = jest.fn();
  await render(<ThinkForm dayNo={3} topic="Synthetic topic" onSave={save} onSubmit={submit} />);
  for (const [, label] of thinkingFields) expect(screen.getByLabelText(label).props.value).toBe('');
  expect(screen.getByRole('button', { name: 'Submit my thinking' })).toBeDisabled();
  for (const [, label] of thinkingFields)
    await fireEvent.changeText(screen.getByLabelText(label), 'My own thought for ' + label);
  expect(screen.getByRole('button', { name: 'Submit my thinking' })).toBeEnabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Submit my thinking' }));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledTimes(4);
});
test('save failure retains the user text and explains recovery', async () => {
  await render(
    <ThinkForm
      dayNo={3}
      topic="Synthetic topic"
      onSave={() => {
        throw new Error('private SQL detail');
      }}
      onSubmit={async () => {}}
    />,
  );
  await fireEvent.changeText(screen.getByLabelText('What do I think?'), 'My position');
  expect(screen.getByLabelText('What do I think?').props.value).toBe('My position');
  expect(screen.getByRole('alert')).toHaveTextContent(/Draft could not be saved/);
  expect(screen.queryByText('private SQL detail')).toBeNull();
});
