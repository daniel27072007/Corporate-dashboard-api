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

  return <div></div>
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