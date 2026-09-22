function App() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-900 text-white gap-6">
      <h1 className="text-4xl font-bold text-green-400">
        Tailwind configurado com sucesso! 🚀
      </h1>
      <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-800 transition-colors">Button</button>
      <div className="bg-gray-600 border border-gray-500 p-6">
        <p className="text-sm text-gray-400">Faturamento Total:</p>
        <p className="text-2xl text-white font-bold">$124,500.00</p>
      </div>
    </div>
  );
}

export default App;