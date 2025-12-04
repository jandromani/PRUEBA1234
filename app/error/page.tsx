import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-500 text-center text-lg font-medium  w-4/5">
        Ooops! 50x15 solo funciona dentro de World App para habilitar las
        verificaciones y pagos. Descarga la{' '}
        <Link href="https://worldcoin.org/download" className="text-blue-500">
          World App
        </Link>{' '}
        en tu dispositivo móvil y abre la mini-app 50x15. Usa este entorno web
        solo para previsualizar; las funciones sensibles deben probarse en
        World App.
      </p>
    </div>
  )
}
