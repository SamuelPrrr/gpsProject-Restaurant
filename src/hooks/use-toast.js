export const toast = ({ title, description, variant }) => {
  console.log(`[Toast ${variant || 'default'}]`, title, description)
  // Implementación simple por consola. Integrar react-toastify o similar después
  alert(`${title}\n${description}`)
}

export const useToast = () => {
  return { toast }
}
