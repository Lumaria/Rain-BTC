import { Canvas, useFrame } from '@react-three/fiber'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

let nextId = 1
// Generates a unique ID for each particle
function generateUniqueId() {
  return `particle-${nextId++}`
}

// Represents a single trade particle with physics and visual properties
function TradeParticle({ position, color, volume, onRemove }) {
  const meshRef = useRef()
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    -3,
    (Math.random() - 0.5) * 2
  ))
  
  const particleSize = Math.max(0.1, Math.min(1.5, 0.1 + Math.log10(volume) * 0.2))

  useFrame((state, delta) => {
    if (!meshRef.current) return

    velocity.current.y -= 3 * delta
    meshRef.current.position.x += velocity.current.x * delta
    meshRef.current.position.y += velocity.current.y * delta
    meshRef.current.position.z += velocity.current.z * delta

    meshRef.current.rotation.x += delta * 0.3
    meshRef.current.rotation.y += delta * 0.3

    if (meshRef.current.position.y < -20) {
      onRemove()
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[particleSize, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

// Manages the creation and lifecycle of trade particles
function ParticleManager() {
  const [particles, setParticles] = useState([])
  const wsRef = useRef(null)
  const queueRef = useRef([])

  // Process queued particles every 50ms to batch updates and improve performance
  useEffect(() => {
    const processQueue = setInterval(() => {
      if (queueRef.current.length > 0) {
        setParticles(prev => {
          const newParticles = [...prev, ...queueRef.current]
          queueRef.current = []
          return newParticles
        })
      }
    }, 50)

    return () => clearInterval(processQueue)
  }, [])

  // Connect to Binance WebSocket API and subscribe to BTC/USDT trade stream
  // Creates particles for each trade with random positions and colors based on buy/sell
  useEffect(() => {
    wsRef.current = new WebSocket('wss://stream.binance.com:9443/ws')
    
    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: ['btcusdt@trade'],
        id: 1
      }))
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (!data.e || data.e !== 'trade') return

      const isBuy = data.m === false
      const volume = parseFloat(data.q)
      const price = parseFloat(data.p)
      const volumeUSDT = volume * price

      queueRef.current.push({
        id: generateUniqueId(),
        position: [
          (Math.random() - 0.5) * 20,
          15,
          (Math.random() - 0.5) * 20
        ],
        isBuy,
        volumeUSDT
      })
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const removeParticle = (id) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      {particles.map(particle => (
        <TradeParticle
          key={particle.id}
          position={particle.position}
          color={particle.isBuy ? '#00ff00' : '#ff0000'}
          volume={particle.volumeUSDT}
          onRemove={() => removeParticle(particle.id)}
        />
      ))}
    </>
  )
}

// Sets up the 3D scene with lighting and particles
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <ParticleManager />
    </>
  )
}

// Main application component that sets up the 3D canvas
function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas 
        camera={{ 
          position: [0, 0, 25],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

export default App
