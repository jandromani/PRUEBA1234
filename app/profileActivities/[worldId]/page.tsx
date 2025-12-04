'use client'

import Header from '@/components/Header'
import UserActivityList from '@/components/userActivity/UserActivityList'

export default function ProfileActivitiesPage() {
  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header title="My Activities" backUrl="/profile" />
      <UserActivityList />
    </main>
  )
}
