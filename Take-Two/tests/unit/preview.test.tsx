import { fireEvent, render, screen } from '@testing-library/react-native';
import PreviewApp from '@/features/preview/preview-app';
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

test('baseline preview hides preparation and reveals sample follow-up only after two simulated takes', async () => {
  await render(<PreviewApp />);
  await fireEvent.press(screen.getByRole('button', { name: 'BEGIN DAY 1' }));
  expect(screen.queryByText('Input & thinking')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'OPEN STUDIO' }));
  expect(screen.getByRole('button', { name: 'PREVIEW RECORDING' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('radio', { name: 'Confidence 3 of 5' }));
  await fireEvent.press(screen.getByRole('button', { name: 'PREVIEW RECORDING' }));
  await fireEvent.press(screen.getByRole('button', { name: 'FINISH PREVIEW TAKE' }));
  expect(screen.getByText('ILLUSTRATIVE FEEDBACK')).toBeOnTheScreen();
  expect(
    screen.queryByText('What is one experience that changed the way you communicate?'),
  ).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'TRY THESE IN TAKE 2' }));
  await fireEvent.press(screen.getByRole('radio', { name: 'Confidence 4 of 5' }));
  await fireEvent.press(screen.getByRole('button', { name: 'PREVIEW RECORDING' }));
  await fireEvent.press(screen.getByRole('button', { name: 'FINISH PREVIEW TAKE' }));
  await fireEvent.press(screen.getByRole('button', { name: 'REVEAL MY FOLLOW-UP' }));
  expect(screen.getByText('SAMPLE FOLLOW-UP')).toBeOnTheScreen();
}, 20000);

test('prepared-day preview keeps thinking blank and gates the outline on all four fields', async () => {
  await render(<PreviewApp />);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Preview day 3: Is social media good or bad?' }),
  );
  await fireEvent.press(screen.getByRole('button', { name: 'START MY PRACTICE' }));
  await fireEvent.press(screen.getByRole('button', { name: 'WRITE MY OWN THOUGHTS' }));
  const fields = screen.getAllByLabelText(/^0[1-4]\s/);
  expect(fields).toHaveLength(4);
  expect(fields.every((field) => field.props.value === '')).toBe(true);
  expect(screen.getByRole('button', { name: 'SUBMIT MY THINKING' })).toBeDisabled();
  for (const field of fields) await fireEvent.changeText(field, 'My own thought');
  await fireEvent.press(screen.getByRole('button', { name: 'SUBMIT MY THINKING' }));
  expect(screen.getByRole('header', { name: 'Outline' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'OPEN STUDIO' })).toBeDisabled();
});
