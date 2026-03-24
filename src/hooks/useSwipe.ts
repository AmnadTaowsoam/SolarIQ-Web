'use client'

import { useState, useCallback, useRef } from 'react'

interface SwipeState {
  direction: 'left' | 'right' | 'up' | 'down' | null
  deltaX: number
  deltaY: number
  isSwiping: boolean
}

interface UseSwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface UseSwipeReturn {
  swipeState: SwipeState
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
}

export function useSwipe({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: UseSwipeOptions = {}): UseSwipeReturn {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    direction: null,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
  })

  const startX = useRef(0)
  const startY = useRef(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) {
      return
    }
    startX.current = touch.clientX
    startY.current = touch.clientY
    setSwipeState({ direction: null, deltaX: 0, deltaY: 0, isSwiping: true })
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) {
      return
    }
    const deltaX = touch.clientX - startX.current
    const deltaY = touch.clientY - startY.current

    let direction: SwipeState['direction'] = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    setSwipeState({ direction, deltaX, deltaY, isSwiping: true })
  }, [])

  const onTouchEnd = useCallback(() => {
    setSwipeState((prev) => {
      if (Math.abs(prev.deltaX) > threshold && Math.abs(prev.deltaX) > Math.abs(prev.deltaY)) {
        if (prev.deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else if (Math.abs(prev.deltaY) > threshold) {
        if (prev.deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
      return { direction: null, deltaX: 0, deltaY: 0, isSwiping: false }
    })
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    swipeState,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}
