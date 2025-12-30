export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="text-center space-y-6 p-8">
                <h1 className="text-6xl font-bold text-orange-600">
                    SUMMO
                </h1>
                <p className="text-2xl text-gray-700">
                    Cardápio Digital Enterprise
                </p>
                <p className="text-gray-500">
                    Next.js 14 + Firebase + SEO Otimizado
                </p>
                <div className="pt-6">
                    <a
                        href="/jc-bar"
                        className="inline-block bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition"
                    >
                        Ver Cardápio Demo
                    </a>
                </div>
            </div>
        </div>
    );
}
