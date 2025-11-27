import Header from '@/components/Header'
import ProfileInfo from '@/components/Profile/ProfileInfo'
import RecentActivity from '@/components/Profile/RecentActivity'

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header title="My Profile" />
      <ProfileInfo />
      <RecentActivity />
    </main>
  )
}
