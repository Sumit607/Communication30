import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export interface DayMilestoneTileProps {
  id: string;
  number: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'locked';
  statusLabel?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function DayMilestoneTile({
  number,
  icon,
  title,
  subtitle,
  status,
  statusLabel,
  expanded,
  onToggle,
  children,
}: DayMilestoneTileProps) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  const iconBg = isCompleted ? '#EAF4ED' : isCurrent ? '#EBF2FC' : '#F3F4F6';
  const iconColor = isCompleted ? theme.success : isCurrent ? theme.accent : theme.muted;

  const badgeBg = isCompleted ? '#EAF4ED' : isCurrent ? '#EBF2FC' : '#F3F4F6';
  const badgeColor = isCompleted ? theme.success : isCurrent ? theme.accent : theme.muted;
  const defaultStatusLabel = isCompleted ? 'Done ✓' : isCurrent ? 'Active ●' : 'Upcoming';

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: isCurrent ? theme.accent : theme.line,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Collapsed Header / Tap to Expand */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${status}. Tap to ${expanded ? 'collapse' : 'expand'}.`}
        onPress={onToggle}
        style={({ pressed }) => ({
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: pressed ? '#F5F7FB' : '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        })}
      >
        {/* Icon Avatar */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: iconBg,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: isCurrent ? 2 : 0,
            borderColor: theme.accent,
          }}
        >
          <Ionicons name={isCompleted ? 'checkmark' : icon} size={20} color={iconColor} />
        </View>

        {/* Title and Subtitle */}
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted }}>
              STEP {number}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.ink }}>{title}</Text>
          </View>
          <Text
            style={{ fontSize: 12, color: theme.muted }}
            numberOfLines={expanded ? undefined : 1}
          >
            {subtitle}
          </Text>
        </View>

        {/* Status Pill & Chevron */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: badgeBg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: badgeColor }}>
              {statusLabel ?? defaultStatusLabel}
            </Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.muted} />
        </View>
      </Pressable>

      {/* Expanded Accordion Body */}
      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.line,
            padding: 16,
            backgroundColor: '#FAFBFC',
            gap: 14,
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
