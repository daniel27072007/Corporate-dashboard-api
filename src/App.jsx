import { useState, useMemo, use } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import salesData from './data/salesMock.json'

function App() {
  const [searchText, setSearchText] = useState("")
  const [categorySelected, setCategorySelected] = useState("all")
  const [dateFirst, setDateFirst] = useState("")
  const [dateLast, setDateLast] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [trendPeriod, setTrendPeriod] = useState("days")

  //filtering data
  const dataFiltred = useMemo(() => {
    return salesData.filter((item) => {
      const filtredBySearch = item.customer.name.toLowerCase().includes(searchText.toLowerCase())
      const filtredByCategory = categorySelected === 'all' || item.category.toLowerCase().includes(categorySelected.toLowerCase())
      const itemDateString = item.date.substring(0,10)
      const filtredByDateFirst = !dateFirst || itemDateString >= dateFirst
      const filtredByDateLast = !dateLast || itemDateString <= dateLast
      return filtredBySearch && filtredByCategory && filtredByDateFirst && filtredByDateLast
    })
  }, [searchText, categorySelected, dateFirst, dateLast])

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

  const revenueComparison = useMemo(() => {
    if (!dateFirst || !dateLast) return null
    const currentStart = new Date(dateFirst + "T00:00:00").getTime()
    const currentEnd = new Date(dateLast + "T23:59:59").getTime()
    if (isNaN(currentStart) || isNaN(currentEnd)) return null

    const millisecondsInDay = 1000 * 60 * 60 * 24
    const totalDays = Math.floor(Math.abs(currentEnd - currentStart) / millisecondsInDay)
    const periodDuration = currentEnd - currentStart
    const pastStart = currentStart - periodDuration - 1000
    const pastEnd = currentStart - 1000

    const currentRevenue = totalRevenue
    const pastRevenue = salesData.reduce((acumulate, item) => {
      const filtredBySearch = item.customer.name.toLowerCase().includes(searchText.toLowerCase())
      const filtredByCategory = categorySelected === 'all' || item.category.toLowerCase().includes(categorySelected.toLowerCase())
      const itemTime = new Date(item.date).getTime()
      const insidePastPeriod = itemTime >= pastStart && itemTime <= pastEnd

      if(filtredBySearch && filtredByCategory && insidePastPeriod){
        return acumulate += item.amount
      }
      return acumulate
    }, 0)

    const diff = currentRevenue - pastRevenue
    const percentage = pastRevenue > 0 ? (diff / pastRevenue) * 100 : 0

    return {
      days: totalDays,
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: diff >= 0
    }
  }, [dataFiltred, dateFirst, dateLast, searchText, categorySelected])

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

  //rechart Category Distribution
  const paleteColours = [ 'rgb(6, 101, 196)', 'rgb(58, 148, 252)' ]
  const rechartCategoryData = useMemo(() => {
    const maping = dataFiltred.reduce((acumulate, item) => {
      if(item.status === "refunded"){
        return acumulate
      }
      const categoryName = item.category;
      if(!acumulate[categoryName]){
        acumulate[categoryName] = 0
      }
      acumulate[categoryName] += item.amount
      return acumulate
    }, {})
    return Object.keys(maping).map((category, index) => {
      const totalValue = maping[category] || 0
      return {
        name: category,
        value: Number(totalValue.toFixed(2)),
        fill: paleteColours[index % paleteColours.length]
      }
    })
  }, [dataFiltred])

   const rechartTrendData = useMemo(() => {
    const grouped = dataFiltred.reduce((acumulate, item) => {
      if (item.status === "refunded") return acumulate
      
      const itemDate = new Date(item.date)
      if (isNaN(itemDate.getTime())) return acumulate

      let groupKey = ""
      if (trendPeriod === 'days') {
        groupKey = itemDate.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" })
      } else {
        groupKey = itemDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      }

      // 1. Se a chave não existir no objeto, começamos ela com 0
      if (!acumulate[groupKey]) {
        acumulate[groupKey] = 0
      }
      
      // 2. Somamos o valor da transação diretamente na chave correspondente
      acumulate[groupKey] += item.amount
      
      // 3. RETORNO OBRIGATÓRIO: Retorna o objeto inteiro para a próxima rodada do loop
      return acumulate
    }, {})

    return Object.keys(grouped).map((key) => ({
      label: key,
      revenue: Number((grouped[key] || 0).toFixed(2))
    })).sort((a, b) => {
      if (trendPeriod === "days") {
        const partsA = a.label.split('/')
        const partsB = b.label.split('/')
        
        if (partsA.length < 2 || partsB.length < 2) return 0

        const [monthA, dayA] = partsA.map(Number)
        const [monthB, dayB] = partsB.map(Number)
        return monthA - monthB || dayA - dayB
      } else {
        const partsA = a.label.split('/')
        const partsB = b.label.split('/')

        if (partsA.length < 2 || partsB.length < 2) return 0

        const monthsOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
        // Converte a string do mês de forma segura antes de buscar o índice
        const mA = monthsOrder.indexOf(partsA[0].toLowerCase())
        const mB = monthsOrder.indexOf(partsB[0].toLowerCase())
        const yearA = parseInt(partsA[1]) || 0
        const yearB = parseInt(partsB[1]) || 0

        return yearA - yearB || mA - mB
      }
    })
  }, [dataFiltred, trendPeriod])

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col gap-6">
      
      {/* 1. CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-gray-400 text-sm">Visão geral de performance corporativa</p>
      </div>

      {/* 2. BARRA DE FILTROS (Vamos criar a lógica visual delas no próximo passo) */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-wrap gap-4 w-full">
        <div className="flex justify-between items-center gap-4">
          {/* Caixa de Busca Textual */}
          <input
            type="text"
            placeholder="Search for client..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full text-sm h-10"
          />
          {/* Selecao de categoria */}
          <select
            value={categorySelected}
            onChange={(e) => setCategorySelected(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full text-sm h-10"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="home & kitchen">Home & Kitchen</option>
          </select>
        </div>
        {/* Seleção de data */}
        <input
          type="date"
          value={dateFirst}
          onChange={(e) => setDateFirst(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full text-sm h-10"
        />
        <input
          type="date"
          value={dateLast}
          onChange={(e) => setDateLast(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full text-sm h-10"
        />
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
          {revenueComparison ? (
            <span className={`text-xs font-medium mt-1 ${revenueComparison.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {revenueComparison.isPositive ? '▲' : '▼'} {revenueComparison.percentage}% 
              <span className="text-gray-500"> vs last {revenueComparison.days} days</span>
            </span>
          ) : (
            <span className="text-xs text-gray-500 italic mt-1">Select a period to see its revenue comparison</span>
          )}
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

      {/* 4. TABELA DE VENDAS CORPORATIVAS */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mt-4">
        
        {/* Painel Superior: Botões de Controle de Ordenação */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex gap-4 text-xs text-gray-400 items-center">
          <span className="font-semibold uppercase tracking-wider">Controles de Ordenação:</span>
          
          <button 
            onClick={() => setSortColumn(sortColumn === "date" ? "price" : "date")}
            className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-colors cursor-pointer"
          >
            Coluna: <strong className="text-blue-400 uppercase">{sortColumn}</strong>
          </button>

          <button 
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-colors cursor-pointer"
          >
            Direção: <strong className="text-blue-400 uppercase">{sortDirection}</strong>
          </button>
        </div>

        {/* Corpo da Tabela HTML */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-700">
              <tr>
                <th className="p-4 font-medium">ID Transação</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {dataOrdnadedPage.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-mono text-blue-400 font-medium">{item.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-white">{item.customer.name}</div>
                    <div className="text-xs text-gray-400">{item.customer.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-900 border border-gray-700 rounded-md text-xs font-medium text-gray-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{item.product}</td>
                  <td className="p-4 text-gray-400 text-xs">
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4 font-semibold text-white">
                    ${item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Barra Inferior: Controle de Paginação Visual */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-white font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Anterior
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-white font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Próximo
            </button>
          </div>
        </div>

      </div>
      
      {/* 5. SEÇÃO DE GRÁFICOS DINÂMICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Card do Gráfico de Categorias */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Category Distribution</h2>
            <p className="text-gray-400 text-xs">Faturamento consolidado por categoria de produto</p>
          </div>

          {/* Container Responsivo do Recharts */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rechartCategoryData} // Sua lista de objetos { name, value, fill }
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value) => [`$ ${formatMoney(value)}`]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card do Gráfico de Tendência de Vendas */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Sales Trend</h2>
              <p className="text-gray-400 text-xs">Crescimento de receita acumulada ao longo do tempo</p>
            </div>
            
            {/* Botões de Alternância Dias / Meses */}
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700 self-end sm:self-auto">
              <button
                onClick={() => setTrendPeriod("days")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  trendPeriod === "days"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Days
              </button>
              <button
                onClick={() => setTrendPeriod("months")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  trendPeriod === "months"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Months
              </button>
            </div>
          </div>

          {/* Container do Gráfico do Recharts */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rechartTrendData} // Array de objetos { label, revenue } calculado no passo anterior
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                {/* Definição do Gradiente Azul Suave sob a Linha */}
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(58, 148, 252)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(58, 148, 252)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Linhas de Grade de Fundo (Apenas Horizontais) */}
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                
                {/* Eixo X: Exibe as Labels "DD/MM" ou Mês Abreviado */}
                <XAxis 
                  dataKey="label" 
                  stroke="#9ca3af" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                
                {/* Eixo Y: Valores Financeiros Formatados */}
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                
                {/* Tooltip Customizado para o Tema Dark */}
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#9ca3af", fontSize: "12px" }}
                  formatter={(value) => [`$ ${formatMoney(value)}`, "Revenue"]}
                />
                
                {/* A Linha e Área do Gráfico */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="rgb(58, 148, 252)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  )
}

export default App;