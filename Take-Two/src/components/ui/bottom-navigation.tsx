import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export function BottomNavigation({ active }: { active: 'practice' | 'progress' | 'settings' }) {
  const insets = useSafeAreaInsets();
  const items = [
    { id: 'practice', label: 'Practice', icon: 'mic-outline', route: '/' },
    { id: 'progress', label: 'Progress', icon: 'bar-chart-outline', route: '/progress' },
    { id: 'settings', label: 'Settings', icon: 'person-circle-outline', route: '/settings' },
  ] as const;
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#ECEEF4',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === item.id }}
          onPress={() => router.navigate(item.route)}
          style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <Ionicons name={item.icon} size={25} color={active === item.id ? '#1748E5' : '#777D86'} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: active === item.id ? '600' : '400',
              color: active === item.id ? '#1748E5' : '#777D86',
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
