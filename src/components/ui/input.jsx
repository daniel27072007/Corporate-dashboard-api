import * as React from 'react'
import { cn } from '../../utils/cn.js'

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
    return(
        <input
            type={type}
            className={cn(
                 // Classes Base (Layout e Tipografia)
                "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
                // Estados de Placeholder e Desativado
                "placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
                // Foco de Acessibilidade Avançado
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ring-offset-white",
                // Suporte Nativo a Dark Mode (Tailwind v4)
                "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-400 dark:focus-visible:ring-indigo-400 dark:ring-offset-gray-950",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = 'Input'

export { Input }