import { useState, useMemo, use } from "react";
import salesData from './data/salesMock.json'

function App() {
  const [searchText, setSearchText] = useState("")
  const [categorySelected, setCategorySelected] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")

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

  //dataTableLogic
  const dataOrdnaded = useMemo(()=>{
    return [...dataFiltred].sort((a,b) => {
      let ValueA = sortColumn === 'price' ? a.amount : new Date(a.date)
      let ValueB = sortColumn === 'price' ? b.amount : new Date(b.date)
      if(sortDirection === 'asc'){
        return ValueA < ValueB ? -1 : 1
      }
      else{
        return ValueA > ValueB ? -1 : 1
      }
    })
  }, [dataFiltred, sortColumn, sortDirection])

  const totalPages = Math.ceil(dataOrdnaded.length / itemsPerPage)

  const dataOrdnadedPage = useMemo(() => {
    const indexStart = (currentPage - 1) * itemsPerPage
    const indexFinal = indexStart + itemsPerPage
    return dataOrdnaded.slice(indexStart, indexFinal)
  }, [dataOrdnaded, currentPage, itemsPerPage])

  

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

      {/* 3. CARTÕES DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cartão 1: Faturamento Total */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Revenue</span>
          <strong className="text-2xl font-bold text-white">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          {/* <span className="text-xs text-green-400 font-medium mt-1">▲ +12% vs last month</span> */}
        </div>

        {/* Cartão 2: Quantidade de Vendas */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Sales Count</span>
          <strong className="text-2xl font-bold text-white">{totalSalesCount}</strong>
          <span className="text-xs text-gray-500 mt-1">Transações concluídas</span>
        </div>

        {/* Cartão 3: Ticket Médio (AOV) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Average Order Value</span>
          <strong className="text-2xl font-bold text-white">
            ${avarageOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="text-xs text-gray-500 mt-1">Média por transação</span>
        </div>

        {/* Cartão 4: Clientes Ativos */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Customers</span>
          <strong className="text-2xl font-bold text-white">{activeCostumersCount}</strong>
          <span className="text-xs text-blue-400 font-medium mt-1">Compradores únicos</span>
        </div>

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