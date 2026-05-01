function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mx-auto text-2xl">
          ⚡
        </div>
        <h1 className="text-5xl font-bold tracking-tight">The Gordo</h1>
        <p className="text-gray-400">React · Vite · TypeScript · Tailwind v4</p>
        <p className="text-gray-600 text-sm">
          Edit{' '}
          <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">
            src/App.tsx
          </code>{' '}
          to get started
        </p>
      </div>
    </div>
  )
}

export default App
