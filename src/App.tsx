import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster richColors position="top-right" closeButton />
    </AuthProvider>
  )
}

export default App
