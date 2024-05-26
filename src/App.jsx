// import React from 'react'
import Background from './components/Background'
import Foreground from './components/Foreground'
import { Loader } from './components/Loader'

function App() {
  return (
    <div className=' relative w-full h-screen bg-zinc-800'>
      <Loader  />
      <Background />
      <Foreground />
    </div>
  )
}

export default App