'use client'

import { motion } from 'framer-motion'
import { Suspense, useEffect, useState } from 'react'
import CategoryCard from '@/components/Category/CategoryCard'
import { UserIcon } from '@/components/icon-components'
import TermsOfServiceModal from '@/components/Modals/TermsModal'
import RecentPolls from '@/components/Poll/RecentPolls'
import { FilterParams } from '@/types/poll'
import { sendHapticFeedbackCommand } from '@/utils/animation'

const categories = [
  {
    id: FilterParams.All,
    title: 'Explore All',
    icon: '/categories/explore-all.svg',
  },
  {
    id: FilterParams.Trending,
    title: 'Trending Polls',
    icon: '/categories/trending-polls.svg',
  },
  {
    id: FilterParams.Recent,
    title: 'Most Recent',
    icon: '/categories/most-recent.svg',
  },
  {
    id: FilterParams.Voted,
    title: 'My Votes',
    icon: '/categories/my-votes.svg',
  },
]

export default function MainView() {
  const [showTerms, setShowTerms] = useState(false)
  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('worldview-terms-accepted')
    if (!hasAcceptedTerms) {
      setShowTerms(true)
    }
  }, [])

  const handleAcceptTerms = () => {
    localStorage.setItem('worldview-terms-accepted', 'true')
    setShowTerms(false)
  }
  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <div className="flex justify-end mb-4">
        <motion.a
          className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300/90 active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
          href="/profile"
          onClick={() => sendHapticFeedbackCommand()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <UserIcon />
        </motion.a>
      </div>

      <motion.h1
        className="text-gray-900 text-lg font-medium leading-tight mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        Discover polls to vote on or create your own!
      </motion.h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            title={category.title}
            icon={category.icon}
            href={`/polls?filter=${category.id}`}
          />
        ))}
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RecentPolls />
      </Suspense>
      {showTerms && <TermsOfServiceModal onAccept={handleAcceptTerms} />}
    </main>
  )
}
