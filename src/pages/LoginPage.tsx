import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signIn(email, password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      navigate('/admin/locations', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-cream">

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-stone-dark shadow-[6px_6px_0px_#78350F] p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-display text-4xl font-bold text-brand-orange leading-tight">
            The Gordo
          </h1>
          <p className="font-display text-stone-dark text-lg font-medium">
            Comidas Rápidas
          </p>
          <div className="w-16 h-1 bg-brand-red mx-auto rounded-full mt-2" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-display font-medium text-stone-dark mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>

          <div>
            <label className="block font-display font-medium text-stone-dark mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-brand-red font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-display font-semibold text-lg py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
