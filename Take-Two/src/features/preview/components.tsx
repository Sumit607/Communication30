import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const colors = {
  blue: '#1748E5',
  navy: '#0C40DB',
  ink: '#1C2027',
  muted: '#626976',
  background: '#F7F8FA',
  line: '#E9ECF2',
  red: '#AB293E',
};
export type IconName = ComponentProps<typeof Ionicons>['name'];
export type TabName = 'home' | 'progress' | 'settings';
export function Icon({
  name,
  size = 24,
  color = colors.blue,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function Copy({
  children,
  muted = false,
  small = false,
}: PropsWithChildren<{ muted?: boolean; small?: boolean }>) {
  return (
    <Text
      style={{
        fontSize: small ? 13 : 16,
        lineHeight: small ? 19 : 24,
        color: muted ? colors.muted : colors.ink,
      }}
    >
      {children}
    </Text>
  );
}
export function Title({ children }: PropsWithChildren) {
  return (
    <Text
      accessibilityRole="header"
      style={{ fontSize: 27, lineHeight: 34, fontWeight: '700', color: colors.ink }}
    >
      {children}
    </Text>
  );
}
export function Action({
  label,
  onPress,
  secondary = false,
  disabled = false,
  recording = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  recording?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 54,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 13,
        backgroundColor: disabled
          ? '#DCE1EB'
          : secondary
            ? '#EDF1FC'
            : recording
              ? colors.red
              : colors.blue,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 16,
          lineHeight: 22,
          fontWeight: '700',
          color: disabled ? '#657083' : secondary ? colors.blue : 'white',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Card({ children }: PropsWithChildren) {
  return (
    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, gap: 16 }}>
      {children}
    </View>
  );
}
export function Row({
  title,
  detail,
  icon,
  onPress,
  complete = false,
}: {
  title: string;
  detail: string;
  icon: IconName;
  onPress?: () => void;
  complete?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingVertical: 12,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 15,
          backgroundColor: '#EDF1FC',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>{title}</Text>
        <Copy muted small>
          {detail}
        </Copy>
      </View>
      <Icon
        name={complete ? 'checkmark-circle' : onPress ? 'chevron-forward' : 'ellipse-outline'}
        size={20}
        color={complete ? '#34715C' : '#89909D'}
      />
    </Pressable>
  );
}
export function Tabs({
  active,
  onNavigate,
}: {
  active: TabName;
  onNavigate: (tab: TabName) => void;
}) {
  const bottom = useSafeAreaInsets().bottom;
  const items = [
    { id: 'home', label: 'Practice', icon: 'mic-outline' },
    { id: 'progress', label: 'Progress', icon: 'bar-chart-outline' },
    { id: 'settings', label: 'You', icon: 'person-circle-outline' },
  ] as const;
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: colors.line,
        paddingTop: 10,
        paddingBottom: Math.max(8, bottom),
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === item.id }}
          onPress={() => onNavigate(item.id)}
          style={{ flex: 1, minHeight: 52, gap: 4, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon
            name={item.icon}
            size={25}
            color={active === item.id ? colors.blue : colors.muted}
          />
          <Text
            style={{
              fontSize: 12,
              color: active === item.id ? colors.blue : colors.muted,
              fontWeight: active === item.id ? '700' : '400',
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Page({
  title,
  children,
  footer,
  onBack,
  tab,
  onNavigate,
}: PropsWithChildren<{
  title: string;
  footer?: ReactNode;
  onBack?: () => void;
  tab?: TabName;
  onNavigate?: (tab: TabName) => void;
}>) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 14,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="arrow-back" color={colors.ink} />
          </Pressable>
        )}
        <Text
          accessibilityRole="header"
          style={{
            fontSize: 25,
            fontWeight: '700',
            color: colors.ink,
            paddingLeft: onBack ? 0 : 8,
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 10,
            letterSpacing: 1,
            fontWeight: '700',
            color: colors.muted,
            paddingRight: 8,
          }}
        >
          UI PREVIEW
        </Text>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 28, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            padding: 20,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 18),
            gap: 10,
            backgroundColor: colors.background,
          }}
        >
          {footer}
        </View>
      )}
      {tab && onNavigate && <Tabs active={tab} onNavigate={onNavigate} />}
    </KeyboardAvoidingView>
  );
}
