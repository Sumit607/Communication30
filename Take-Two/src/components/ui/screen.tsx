import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

export function Screen({
  title,
  detail,
  children,
  footer,
  back = true,
  dark = false,
}: PropsWithChildren<{
  title: string;
  detail?: string;
  footer?: ReactNode;
  back?: boolean;
  dark?: boolean;
}>) {
  const insets = useSafeAreaInsets();
  const ink = dark ? '#F8F6F2' : theme.ink;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: dark ? theme.dark : theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          paddingTop: insets.top,
        }}
      >
        <View
          style={{
            height: 62,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            gap: 8,
          }}
        >
          {back && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="arrow-back" size={25} color={ink} />
            </Pressable>
          )}
          <Text
            accessibilityRole="header"
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: ink,
              flex: 1,
              paddingLeft: back ? 0 : 8,
            }}
          >
            {title}
          </Text>
          {detail && (
            <Text style={{ color: dark ? '#B8B8B8' : theme.muted, fontSize: 16, paddingRight: 8 }}>
              {detail}
            </Text>
          )}
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: theme.space, paddingTop: 10, gap: 24, flexGrow: 1 }}
        >
          {children}
        </ScrollView>
        {footer && (
          <View
            style={{
              paddingHorizontal: theme.space,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 14),
              gap: 10,
            }}
          >
            {footer}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
