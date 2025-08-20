import posthog from 'posthog-js'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (posthogKey) {
  posthog.init(posthogKey, { api_host: posthogHost })
}

export interface AnalyticsPayload {
  note_id: string
  block_id?: string | null
  user_id?: string | null
}

export function track(event: string, payload: AnalyticsPayload) {
  if (!posthogKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('analytics event', { event, ...payload })
    }
    return
  }
  const send = () => posthog.capture(event, payload)
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(send)
  } else {
    setTimeout(send, 0)
  }
}
const analytics = { track }

export default analytics
