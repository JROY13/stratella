import Sidebar from '@/components/Sidebar'

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
