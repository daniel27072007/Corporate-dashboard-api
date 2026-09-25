import * as React from "react"
import { cn } from "../../utils/cn"

const SelectCustom = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          // Classes Base (Alinhadas perfeitamente com o nosso Input)
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors",
          "appearance-none pr-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          // Regras de Foco Inteligente e Acessibilidade (Padrão Shadcn)
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ring-offset-white",
          // Suporte a Dark Mode Nativo
          "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:focus-visible:ring-indigo-400 dark:ring-offset-gray-950",
          className
        )}
        {...props}
      >
        {children}
      </select>
      
      {/* Ícone customizado de seta para substituir o indicador nativo feio do navegador */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
        <svg
          xmlns="http://w3.org"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  )
})
SelectCustom.displayName = "SelectCustom"

export { SelectCustom }