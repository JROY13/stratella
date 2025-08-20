export interface AnalyticsPayload {
  note_id: string
  block_id?: string | null
  user_id?: string | null
}

export function track(event: string, payload: AnalyticsPayload) {
  // Placeholder analytics implementation; replace with real provider
  console.log('analytics event', { event, ...payload })
}
const analytics = { track }

export default analytics
