export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700">Página não encontrada</h2>
                <p className="text-gray-500">
                    A página que você está procurando não existe.
                </p>
                <a
                    href="/"
                    className="inline-block mt-6 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition"
                >
                    Voltar para Home
                </a>
            </div>
        </div>
    );
}
