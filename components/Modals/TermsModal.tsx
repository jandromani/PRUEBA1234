'use client'

interface TermsOfServiceModalProps {
  onAccept: () => void
}

export default function TermsOfServiceModal({
  onAccept,
}: TermsOfServiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">
            Términos de servicio de 50x15
          </h2>

          <p className="mb-4">
            Al usar 50x15 aceptas los siguientes términos:
          </p>

          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li>Usa la app solo con tu World ID verificado.</li>
            <li>No publiques contenido ilegal, dañino o engañoso.</li>
            <li>
              No suplantes identidades, especialmente de personas del equipo de
              World o de 50x15.
            </li>
            <li>
              No promuevas estafas, phishing ni enlaces sospechosos.
            </li>
            <li>
              No ofrezcas recompensas ni pagos por votos fuera de la mini-app
              50x15 en World App.
            </li>
            <li>
              No solicites dinero, donaciones ni contribuciones financieras a
              otros usuarios.
            </li>
            <li>
              No publiques contenido que dañe o tergiverse a 50x15, World o a
              sus colaboradores, empleados o marcas.
            </li>
          </ul>

          <p className="mb-4">
            Content that violates these terms will be removed without notice.
            Repeated violations may result in further restrictions.
          </p>

          <p className="mb-2">For questions, contact us at:</p>
          <p className="font-medium mb-6">info@generalmagic.io</p>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onAccept}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  )
}
