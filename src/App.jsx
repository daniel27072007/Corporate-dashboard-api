import { useState, useMemo } from "react";
import salesData from './data/salesMock.json'

function App() {
  const [searchText, setSearchText] = useState("")
  const [categorySelected, setCategorySelected] = useState("all")

  //filtering data
  const dataFiltred = useMemo(() => {
    return salesData.filter((item) => {
      const filtredBySearch = item.customer.name.toLowerCase().includes(searchText.toLowerCase())
      const filtredByCategory = categorySelected === 'all' || item.category.toLowerCase().includes(categorySelected.toLowerCase())
      return filtredBySearch && filtredByCategory
    })
  }, [searchText, categorySelected])

  //metrics
  const totalRevenue = useMemo(() => {
    return dataFiltred.reduce((acumulate, item) => { return acumulate + item.amount }, 0 )
  }, [dataFiltred])

  const totalSalesCount = dataFiltred.length

  const avarageOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0

  const activeCostumersCount = useMemo(() => {
    const listOfUniqueClients = new Set(dataFiltred.map(item => item.customer.email))
    return listOfUniqueClients.size
  }, [dataFiltred])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col gap-6">
      
      {/* 1. CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-gray-400 text-sm">Visão geral de performance corporativa</p>
      </div>

      {/* 2. BARRA DE FILTROS (Vamos criar a lógica visual delas no próximo passo) */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex gap-4">
        {/* Caixa de Busca Textual */}
        <input
          type="text"
          placeholder="Search for client..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full md:w-80 text-sm"
        />
        {/* Selecao de categoria */}
        <select
          value={categorySelected}
          onChange={(e) => setCategorySelected(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full md:w-80 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="home & kitchen">Home & Kitchen</option>
        </select>
        {/* Contador de Resultados Filtrados */}
        <span className="text-xs text-gray-400 self-center ml-auto">
          Encontred results: <strong className="text-blue-400 text-sm font-bold">{dataFiltred.length}</strong>
        </span>

      </div>

    </div>
  )
}

export default App;

// function App() {
//   return (
//     <div className="flex flex-col min-h-screen items-center justify-center bg-gray-900 text-white gap-6">
//       <h1 className="text-4xl font-bold text-green-400">
//         Tailwind configurado com sucesso! 🚀
//       </h1>
//       <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-800 transition-colors">Button</button>
//       <div className="bg-gray-600 border border-gray-500 p-6">
//         <p className="text-sm text-gray-400">Faturamento Total:</p>
//         <p className="text-2xl text-white font-bold">$124,500.00</p>
//       </div>
//     </div>
//   );
// }

// export default App;