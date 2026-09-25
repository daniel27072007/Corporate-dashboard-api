import { useState, useMemo } from "react"
import salesData from '../data/salesMock.json'

export const dashboard = () => {
  const [searchText, setSearchText] = useState("")
  const [categorySelected, setCategorySelected] = useState("all")
  const [dateFirst, setDateFirst] = useState("")
  const [dateLast, setDateLast] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [trendPeriod, setTrendPeriod] = useState("months")
  const [darkMode, setDarkMode] = useState(true)

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

  return {
    // Filters and states of control
    searchText, setSearchText,
    categorySelected, setCategorySelected,
    dateFirst, setDateFirst,
    dateLast, setDateLast,
    currentPage, setCurrentPage,
    sortColumn, setSortColumn,
    sortDirection, setSortDirection,
    trendPeriod, setTrendPeriod,
    darkMode, setDarkMode,
    
    //Results done for the UI
    dataFiltred,
    totalRevenue,
    totalSalesCount,
    avarageOrderValue,
    activeCostumersCount,
    revenueComparison,
    totalPages,
    dataOrdnadedPage,
    rechartCategoryData,
    rechartTrendData
  };
}