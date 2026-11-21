import { useState } from 'react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Workspace from './components/layout/Workspace'

export default function App() {
  const [algorithm, setAlgorithm] = useState('caesar')

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selected={algorithm} onSelect={setAlgorithm} />
        <Workspace key={algorithm} algorithm={algorithm} />
      </div>
    </div>
  )
}