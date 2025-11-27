import { motion } from 'framer-motion'
import { pollCardVariants } from '@/lib/constants/animationVariants'

export default function BlurredCard() {
  return (
    <motion.div
      variants={pollCardVariants}
      className="w-full bg-white rounded-xl p-6 flex-1 mb-6 shadow-[0_0_16px_0_#00000029] animate-fadeInUp"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full w-[35%] animate-pulse"></div>
        </div>
        <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded-full w-full mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded-full w-5/6 mb-6 animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded-full w-full mb-2 animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded-full w-4/5 mb-6 animate-pulse"></div>
      <div className="h-14 bg-gray-200 rounded-lg w-full animate-pulse"></div>
    </motion.div>
  )
}
