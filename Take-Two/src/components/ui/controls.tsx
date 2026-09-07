import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { theme } from '@/constants/theme';

export function Button({
  label,
  onPress,
  disabled = false,
  busy = false,
  secondary = false,
  dark = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  secondary?: boolean;
  dark?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: secondary ? 'transparent' : disabled ? theme.disabled : theme.accent,
        borderWidth: secondary ? 1 : 0,
        borderColor: theme.border,
        opacity: pressed || busy ? 0.7 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? theme.accent : '#FFFFFF'} />
      ) : (
        <Text
          style={{
            fontSize: 16,
            lineHeight: 23,
            fontWeight: '600',
            color: dark && secondary ? '#F8F6F2' : secondary || disabled ? theme.ink : '#FFFFFF',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
export function Heading({ children }: PropsWithChildren) {
  return (
    <Text
      selectable
      accessibilityRole="header"
      style={{ color: theme.ink, fontSize: 26, fontWeight: '700', lineHeight: 33 }}
    >
      {children}
    </Text>
  );
}
export function Body({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) {
  return (
    <Text
      selectable
      style={{ color: muted ? theme.muted : theme.ink, fontSize: 16, lineHeight: 24 }}
    >
      {children}
    </Text>
  );
}
export function Notice({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="alert" style={{ color: theme.accent, fontSize: 15, lineHeight: 22 }}>
      {children}
    </Text>
  );
}
export function Field({
  label,
  hint,
  number,
  compact,
  ...props
}: TextInputProps & { label: string; hint?: string; number?: string; compact?: boolean }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {number && (
          <Text style={{ color: theme.accent, fontSize: 17, fontWeight: '600' }}>{number}</Text>
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>{label}</Text>
          {hint && <Text style={{ fontSize: 14, lineHeight: 20, color: theme.muted }}>{hint}</Text>}
        </View>
      </View>
      <TextInput
        accessibilityLabel={label}
        multiline={!compact}
        textAlignVertical="top"
        {...props}
        style={[
          {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 7,
            minHeight: compact ? 50 : 86,
            padding: 12,
            color: theme.ink,
            fontSize: 16,
            lineHeight: 23,
            backgroundColor: theme.background,
          },
          props.style,
        ]}
      />
    </View>
  );
}
