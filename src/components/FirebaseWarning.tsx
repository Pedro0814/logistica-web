"use client"

export default function FirebaseWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Firebase Não Configurado
          </h3>
          <p className="text-yellow-700 mb-4">
            Para usar todas as funcionalidades (salvar planejamentos, anexos, etc.), você precisa configurar o Firebase.
            Por enquanto, você pode usar o modo de demonstração.
          </p>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Como configurar:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Crie um projeto no <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">Firebase Console</a></li>
              <li>Habilite Firestore Database e Storage</li>
              <li>Crie um arquivo <code className="bg-yellow-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
              <li>Adicione suas credenciais do Firebase</li>
              <li>Reinicie o servidor de desenvolvimento</li>
            </ol>
            <p className="text-xs text-yellow-600 mt-2">
              Veja o arquivo <code className="bg-yellow-100 px-1 rounded">FIREBASE_SETUP.md</code> para instruções detalhadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

