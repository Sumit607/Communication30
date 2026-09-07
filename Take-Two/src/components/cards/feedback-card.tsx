import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { theme } from '@/constants/theme';
export function FeedbackCard({ title, children, strength = false }: PropsWithChildren<{ title: string; strength?: boolean }>) {
  return <View style={{ backgroundColor: strength ? '#EAF4ED' : 'white', padding: 20, borderRadius: 20, gap: 12 }}>
    {strength && <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />}
    <Text accessibilityRole="header" style={{ fontSize: 18, lineHeight: 25, fontWeight: '700', color: strength ? '#285A42' : theme.ink }}>{title}</Text>
    {children}
  </View>;
}
