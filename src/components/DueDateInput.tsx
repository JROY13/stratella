'use client'

import { Input } from '@/components/ui/input'

type Props = {
  defaultValue?: string
}

export default function DueDateInput({ defaultValue }: Props) {
  return (
    <Input
      type="date"
      name="due"
      defaultValue={defaultValue ?? ''}
      className="w-36"
      onChange={e => e.currentTarget.form?.requestSubmit()}
    />
  )
}
