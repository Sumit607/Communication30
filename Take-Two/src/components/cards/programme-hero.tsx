import { Image, Pressable, Text, View } from 'react-native';
export function ProgrammeHero({
  dayNo,
  title,
  topic,
  detail,
  action,
  onPress,
}: {
  dayNo: number;
  title: string;
  topic: string;
  detail: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={{ height: 326, borderRadius: 20, overflow: 'hidden', backgroundColor: '#0839DA' }}>
      <Image
        source={require('../../../assets/images/speaking-hero.png')}
        style={{ position: 'absolute', top: 0, right: -40, width: 489, height: 326 }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <View style={{ padding: 20, paddingTop: 30, flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>DAY {dayNo}</Text>
          <Text
            style={{
              fontSize: 29,
              lineHeight: 33,
              fontWeight: '700',
              color: 'white',
              maxWidth: '63%',
            }}
          >
            {title}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: 'white', maxWidth: '57%' }}>
            {topic}
          </Text>
        </View>
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 12, color: 'white' }}>{detail}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => ({
              minHeight: 52,
              backgroundColor: 'white',
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 15,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#123DDB', fontSize: 17, fontWeight: '700' }}>{action}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
