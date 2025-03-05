import { getCurrentInstance } from 'vue'

export function useEventListeners() {
  const instance = getCurrentInstance()
  const acceptedProps = instance?.vnode.props ?? {}

  const eventListeners = Object.keys(acceptedProps)
    .filter(item => item.startsWith('on') && typeof acceptedProps[item] === 'function')
    .reduce(
      (listeners, item) => {
        listeners[item.replace('on', '').replace(/[A-Z]/, '$&').toLowerCase()] = acceptedProps[item]
        return listeners
      },
      {} as Record<string, Function>
    )
  return {
    eventListeners,
    eventListenerNames: Object.keys(eventListeners)
  }
}
