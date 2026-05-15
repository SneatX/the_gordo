import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-cream font-body flex flex-col items-center justify-center px-4 text-center">

      <div className="mb-6">
        <img src="/icon.png" alt="The Gordo" className="w-20 h-20 rounded-2xl border-4 border-stone-dark shadow-[5px_5px_0px_#78350F] mx-auto" />
      </div>

      <div className="inline-block bg-brand-red text-white font-display font-black text-7xl md:text-9xl px-6 py-3 rounded-3xl border-4 border-stone-dark shadow-[8px_8px_0px_#78350F] mb-6 rotate-[-2deg]">
        404
      </div>

      <h1 className="font-display font-black text-2xl md:text-3xl text-stone-dark mb-3">
        ¡Esta página no existe!
      </h1>
      <p className="text-stone-mid text-base max-w-sm mb-10">
        Parece que te perdiste. La página que buscas no está disponible.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white font-display font-bold text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Ir al inicio
        </Link>
        <Link
          to="/reservar"
          className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-stone-dark font-display font-bold text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          Hacer una reserva
        </Link>
      </div>
    </div>
  )
}
