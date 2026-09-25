import * as React from 'react'
import { cn } from '../../utils/cn.js'

// 1. O container principal do Card
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm transition-colors",
      "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

// 2. O cabeçalho (agrupa título e descrição)
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("flex flex-col space-y-1.5 p-6", className)} 
    {...props} 
  />
))
CardHeader.displayName = "CardHeader"

// 3. O título principal do Card
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// 4. A descrição secundária (texto de apoio)
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// 5. O corpo principal onde ficam os dados ou gráficos
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }