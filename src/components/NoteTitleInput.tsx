'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { updateNoteTitle } from '@/app/actions'
import {
  AUTOSAVE_THROTTLE_MS,
  SaveStatus,
  saveWithRetry,
} from '@/components/editor/InlineEditor'

interface NoteTitleInputProps {
  noteId: string
  initialTitle: string
}

export default function NoteTitleInput({
  noteId,
  initialTitle,
}: NoteTitleInputProps) {
  const [title, setTitle] = React.useState(initialTitle)
  const [status, setStatus] = React.useState<SaveStatus>('saved')
  const saveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const attempts = React.useRef(0)

  const runSave = React.useCallback(
    (value: string) => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current)
        retryTimeout.current = null
      }
      saveWithRetry(
        () => updateNoteTitle(noteId, value),
        setStatus,
        attempts,
        retryTimeout,
      ).catch(() => {})
    },
    [noteId],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setTitle(value)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current)
      retryTimeout.current = null
      attempts.current = 0
    }
    setStatus('saving')
    saveTimeout.current = setTimeout(
      () => runSave(value),
      AUTOSAVE_THROTTLE_MS,
    )
  }

  const handleBlur = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current)
      retryTimeout.current = null
      attempts.current = 0
    }
    runSave(title)
  }

  React.useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      if (retryTimeout.current) clearTimeout(retryTimeout.current)
    }
  }, [])

  return (
    <div className="space-y-1">
      <Input
        name="title"
        value={title}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="title"
        className="text-3xl md:text-3xl font-bold h-auto py-0 border-0 px-0 focus-visible:ring-0"
      />
      <div className="text-xs text-muted-foreground text-right h-4">
        {status === 'saving' && 'Saving…'}
        {status === 'saved' && 'Saved'}
        {status === 'retrying' && 'Retrying'}
      </div>
    </div>
  )
}

