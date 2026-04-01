import { StyleSheet, Text, View } from 'react-native'
import { theme } from '@/theme'

interface TimerDisplayProps {
  seconds: number
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(totalSeconds: number): { h: string; m: string; s: string } {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { h: pad(h), m: pad(m), s: pad(s) }
}

export function TimerDisplay({ seconds }: TimerDisplayProps) {
  const { h, m, s } = formatTime(seconds)
  const showHours = seconds >= 3600

  return (
    <View style={styles.container}>
      {showHours && (
        <>
          <Text style={styles.digits}>{h}</Text>
          <Text style={styles.separator}>:</Text>
        </>
      )}
      <Text style={styles.digits}>{m}</Text>
      <Text style={styles.separator}>:</Text>
      <Text style={styles.digits}>{s}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digits: {
    fontSize: 64,
    fontWeight: '200',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  separator: {
    fontSize: 48,
    fontWeight: '200',
    color: theme.colors.textMuted,
    marginBottom: 4,
    marginHorizontal: 2,
  },
})
