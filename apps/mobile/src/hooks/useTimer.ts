import { useEffect, useRef, useCallback } from 'react'
import { useSessionStore } from '@/store/sessionStore'

export type TimerState = 'idle' | 'running' | 'paused' | 'ended'

/**
 * Core timer hook. Counts up in seconds.
 * The app never pressures — pause and resume freely.
 * Even 10 seconds is a victory.
 */
export function useTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    timerState,
    elapsedSeconds,
    setTimerState,
    incrementSecond,
    resetTimer,
    startSession,
    endSession,
  } = useSessionStore()

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTick = useCallback(() => {
    clearTick()
    intervalRef.current = setInterval(() => {
      incrementSecond()
    }, 1000)
  }, [clearTick, incrementSecond])

  const start = useCallback(() => {
    startSession()
    setTimerState('running')
    startTick()
  }, [startSession, setTimerState, startTick])

  const pause = useCallback(() => {
    clearTick()
    setTimerState('paused')
  }, [clearTick, setTimerState])

  const resume = useCallback(() => {
    setTimerState('running')
    startTick()
  }, [setTimerState, startTick])

  const end = useCallback(() => {
    clearTick()
    setTimerState('ended')
    endSession()
  }, [clearTick, setTimerState, endSession])

  const reset = useCallback(() => {
    clearTick()
    resetTimer()
  }, [clearTick, resetTimer])

  // Clean up on unmount
  useEffect(() => {
    return () => clearTick()
  }, [clearTick])

  return {
    timerState,
    elapsedSeconds,
    start,
    pause,
    resume,
    end,
    reset,
    isRunning: timerState === 'running',
    isPaused: timerState === 'paused',
    isIdle: timerState === 'idle',
    isEnded: timerState === 'ended',
  }
}
