'use client'

import * as React from 'react'
import type { ToastProps } from '../components/ui/Toast'

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 6000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
  position?: 'top' | 'bottom'
}

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'REMOVE_TOAST': {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter(t => t.id !== toastId),
        }
      }

      return {
        ...state,
        toasts: [],
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, 'id'>

function toast({ duration, ...props }: Toast) {
  const id = genId()

  const dismiss = () =>
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: id,
    })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      duration: duration || TOAST_REMOVE_DELAY,
    },
  })

  return {
    id,
    dismiss,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  React.useEffect(() => {
    state.toasts.forEach(toast => {
      if (!toastTimeouts.has(toast.id)) {
        const timeout = setTimeout(() => {
          toastTimeouts.delete(toast.id)
          dispatch({
            type: 'REMOVE_TOAST',
            toastId: toast.id,
          })
        }, toast.duration || TOAST_REMOVE_DELAY)

        toastTimeouts.set(toast.id, timeout)
      }
    })

    return () => {
      toastTimeouts.forEach(timeout => {
        clearTimeout(timeout)
      })
      toastTimeouts.clear()
    }
  }, [state.toasts])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'REMOVE_TOAST', toastId }),
  }
}

export { useToast, toast }
