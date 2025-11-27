import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-500 text-center text-lg font-medium  w-4/5">
        Ooops! This mini-app can only be accessed inside of the World App.
        Download the{' '}
        <Link href="https://worldcoin.org/download" className="text-blue-500">
          World App
        </Link>{' '}
        on your mobile device and find the WorldView mini-app
      </p>
    </div>
  )
}
