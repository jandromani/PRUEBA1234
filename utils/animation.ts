import { MiniKit } from '@worldcoin/minikit-js'

type ImpactStyle = 'light' | 'medium' | 'heavy'
type NotificationStyle = 'error' | 'success' | 'warning'

type HapticFeedbackConfig =
  | { type: 'impact'; style: ImpactStyle }
  | { type: 'selectionChanged' }
  | { type: 'notification'; style: NotificationStyle }

export const sendHapticFeedbackCommand = (
  config: HapticFeedbackConfig = { type: 'impact', style: 'light' },
) => {
  switch (config.type) {
    case 'impact':
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'impact',
        style: config.style,
      })
      break

    case 'selectionChanged':
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'selection-changed',
      })
      break

    case 'notification':
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'notification',
        style: config.style,
      })
      break
  }
}
