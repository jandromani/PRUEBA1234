import { motion } from 'framer-motion'
import Image from 'next/image'

export default function NoUserActivityView() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 pt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-10 relative">
        <Image
          src="/illustrations/no-polls.svg"
          alt="No user activity"
          width={221}
          height={150}
        />
      </div>
      <h2 className="text-xl text-gray-900 font-medium mb-2 text-center">
        No corresponding activities to show for this user
      </h2>
    </motion.div>
  )
}
