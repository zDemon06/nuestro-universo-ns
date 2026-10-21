import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, OrbitControls } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { supabase, supabaseConfigured } from './supabase'

const planets = [
  {name:'Mercurio', color:'#b9c3d1', phrase:'Desde que llegaste a mi vida, hasta los días más pequeños tienen un significado inmenso.', size:.28, orbit:2.1, speed:.42},
  {name:'Venus', color:'#e9b98b', phrase:'Entre millones de estrellas, ninguna brilla tan bonito como tú ante mis ojos.', size:.38, orbit:2.8, speed:.31},
  {name:'Tierra', color:'#4d9dff', phrase:'No importa en qué lugar del universo esté, mi hogar siempre será donde estés tú.', size:.42, orbit:3.55, speed:.24},
  {name:'Marte', color:'#d97866', phrase:'Si tuviera que cruzar todo el universo para encontrarte, lo haría una y mil veces.', size:.34, orbit:4.25, speed:.19},
  {name:'Júpiter', color:'#d7b89b', phrase:'Ni el planeta más grande podría contener todo lo que siento por ti.', size:.62, orbit:5.15, speed:.14},
  {name:'Saturno', color:'#d9ce9e', phrase:'Así como los anillos rodean a Saturno, quiero que mi cariño te acompañe cada día.', size:.52, orbit:6.1, speed:.11},
  {name:'Urano', color:'#93e1ed', phrase:'Llegaste sin avisar y convertiste mi universo en algo extraordinario.', size:.43, orbit:7.05, speed:.085},
  {name:'Neptuno', color:'#467cff', phrase:'Aunque el universo no tuviera final, todavía me faltarían estrellas para explicarte cuánto te amo.', size:.42, orbit:7.9, speed:.067}
]
const FINAL_DEDICATION = 'Nathalie, se que ultimamente te estoy haciendo muchos detalles y ¿que te digo? es la verdad y me salen desde el corazon hacerlas. Pero bueno te he dicho un monton de veces que mi amor por ti es mas grande que una galaxia, pues ahora te muestro nuestra propia galaxia, una en la que muestro el amor que te tengo y para que veas lo corto que le queda el universo en comparacion a mi amor, gracias por llegar a mi vida y se que lo repito mucho, pero es asi, TE AMO... N+S FOREVER. '
function createPlanetTexture(name, baseColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512

  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  // Fondo con variaciones de luz y color.
  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, baseColor)
  gradient.addColorStop(0.5, '#17283e')
  gradient.addColorStop(1, baseColor)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // Texturas deterministas: no cambian aleatoriamente al renderizar.
  let seed = name.length * 7919
  function random() {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  // Bandas atmosféricas de Júpiter, Saturno, Urano y Neptuno.
  if (['Júpiter', 'Saturno', 'Urano', 'Neptuno'].includes(name)) {
    const bandColors = name === 'Júpiter'
      ? ['#e7c8a6', '#8e6956', '#f0dfc8', '#a77d64', '#d9b797']
      : name === 'Saturno'
      ? ['#f0dfb2', '#b8a078', '#e7d5a5', '#9c8867']
      : name === 'Urano'
      ? ['#b4edf0', '#70c7d5', '#9ae0e9']
      : ['#3160bc', '#24488f', '#5385e3', '#1e3978']

    for (let y = 0; y < h; y += 4 + random() * 13) {
      ctx.globalAlpha = 0.22 + random() * 0.48
      ctx.fillStyle = bandColors[
        Math.floor(random() * bandColors.length)
      ]
      ctx.fillRect(0, y, w, 3 + random() * 18)

      // Pequeñas ondulaciones para evitar bandas perfectamente rectas.
      ctx.globalAlpha = 0.13
      ctx.beginPath()
      ctx.moveTo(0, y + 8)
      for (let x = 0; x <= w; x += 32) {
        ctx.lineTo(x, y + 8 + Math.sin(x * 0.025 + y) * 7)
      }
      ctx.lineTo(w, y + 24)
      ctx.lineTo(0, y + 24)
      ctx.closePath()
      ctx.fill()
    }

    // La gran mancha de Júpiter.
    if (name === 'Júpiter') {
      ctx.globalAlpha = 0.8
      ctx.fillStyle = '#b85f46'
      ctx.beginPath()
      ctx.ellipse(690, 310, 64, 25, -0.08, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#f1c5a2'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.ellipse(690, 310, 48, 15, -0.08, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // Continentes y masas oceánicas de la Tierra.
  if (name === 'Tierra') {
    ctx.globalAlpha = 0.95

    for (let i = 0; i < 25; i++) {
      const x = random() * w
      const y = random() * h
      const rx = 12 + random() * 55
      const ry = 8 + random() * 28

      ctx.fillStyle = random() > 0.5 ? '#55996c' : '#9eaa6b'
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Nubes blancas sobre la superficie.
    for (let i = 0; i < 240; i++) {
      ctx.globalAlpha = 0.08 + random() * 0.25
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.ellipse(
        random() * w,
        random() * h,
        8 + random() * 35,
        2 + random() * 7,
        random() * 0.4,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  }

  // Cráteres de Mercurio y Marte.
  if (name === 'Mercurio' || name === 'Marte') {
    for (let i = 0; i < 180; i++) {
      const x = random() * w
      const y = random() * h
      const r = 2 + random() * (name === 'Marte' ? 17 : 22)

      ctx.globalAlpha = 0.12 + random() * 0.3
      ctx.fillStyle = '#101722'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.25
      ctx.strokeStyle = '#e0d5c9'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x - r * 0.12, y - r * 0.12, r * 0.78, Math.PI, Math.PI * 1.8)
      ctx.stroke()
    }
  }

  // Neblina y estrías suaves en Venus.
  if (name === 'Venus') {
    for (let i = 0; i < 100; i++) {
      ctx.globalAlpha = 0.06 + random() * 0.16
      ctx.strokeStyle = random() > 0.5 ? '#fff0d6' : '#a86f4d'
      ctx.lineWidth = 2 + random() * 9
      ctx.beginPath()
      const y = random() * h
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(
        w * 0.3, y - 35,
        w * 0.7, y + 35,
        w, y + random() * 20
      )
      ctx.stroke()
    }
  }

  // Bruma y microdetalles superficiales.
  for (let i = 0; i < 1800; i++) {
    ctx.globalAlpha = random() * 0.12
    ctx.fillStyle = random() > 0.5 ? '#ffffff' : '#06101f'
    ctx.fillRect(random() * w, random() * h, 1 + random() * 3, 1 + random() * 2)
  }

  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  return texture
}
function Heart() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, -0.25)
    s.bezierCurveTo(-0.85, 0.3, -1.05, -0.35, 0, -1.0)
    s.bezierCurveTo(1.05, -0.35, 0.85, 0.3, 0, -0.25)
    return s
  }, [])

  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return

    const t = clock.elapsedTime
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.12

    const pulse = 1 + Math.sin(t * 2.1) * 0.025
    ref.current.scale.setScalar(pulse)
  })

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.12}>
        {/* Halo suave alrededor del cristal */}
        <mesh scale={1.14}>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: 0.3,
                bevelEnabled: true,
                bevelSegments: 6,
                steps: 1,
                bevelSize: 0.1,
                bevelThickness: 0.1
              }
            ]}
          />
          <meshBasicMaterial
            color="#168aff"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Corazón principal de cristal azul */}
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                depth: 0.3,
                bevelEnabled: true,
                bevelSegments: 8,
                steps: 1,
                bevelSize: 0.075,
                bevelThickness: 0.09
              }
            ]}
          />
          <meshPhysicalMaterial
            color="#61baff"
            emissive="#087aff"
            emissiveIntensity={0.75}
            metalness={0.22}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transmission={0.12}
            thickness={0.8}
            ior={1.35}
          />
        </mesh>
      </Float>
    </group>
  )
}
function PlanetMesh({ planet, index, onSelect }) {
  const orbitRef = useRef()
  const sphereRef = useRef()

  const texture = useMemo(
    () => createPlanetTexture(planet.name, planet.color),
    [planet.name, planet.color]
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (orbitRef.current) {
      const angle = t * planet.speed + index * 0.65

      orbitRef.current.position.set(
        Math.cos(angle) * planet.orbit,
        Math.sin(angle * 0.7) * 0.13,
        Math.sin(angle) * planet.orbit * 0.68
      )
    }

    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0025
    }
  })

  return (
    <group>
      {/* Órbita del planeta */}
      <mesh rotation={[Math.PI / 2.35, 0, 0]}>
        <torusGeometry args={[planet.orbit, 0.008, 6, 180]} />
        <meshBasicMaterial
          color="#4b8dce"
          transparent
          opacity={0.24}
        />
      </mesh>

      {/* Movimiento orbital */}
      <group ref={orbitRef}>
        {/* Halo atmosférico */}
        <mesh scale={1.09}>
          <sphereGeometry args={[planet.size, 40, 40]} />
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={0.10}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Superficie texturizada */}
        <mesh
          ref={sphereRef}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(planet)
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
          }}
        >
          <sphereGeometry args={[planet.size, 64, 64]} />

          <meshStandardMaterial
            map={texture}
            roughness={0.88}
            metalness={0.03}
          />
        </mesh>

        {/* Anillos tridimensionales de Saturno */}
        {planet.name === 'Saturno' && (
          <mesh rotation={[Math.PI / 2.15, 0, 0]}>
            <ringGeometry
              args={[
                planet.size * 1.25,
                planet.size * 2.05,
                96
              ]}
            />
            <meshStandardMaterial
              color="#d8c69c"
              roughness={0.75}
              metalness={0.12}
              side={THREE.DoubleSide}
              transparent
              opacity={0.88}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}
function Galaxy({ onSelect }) {
  return (
    <>
      <Canvas
        camera={{
          position: [0, 5, 16],
          fov: 45,
          near: 0.1,
          far: 150
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#030817', 1)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
        }}
      >
        {/* Fondo espacial */}
        <color attach="background" args={['#030817']} />

        <fog attach="fog" args={['#030817', 25, 65]} />

        {/* Iluminación principal azul */}
        <ambientLight intensity={0.65} />

        <pointLight
          position={[0, 0, 0]}
          intensity={35}
          color="#258bff"
          distance={22}
          decay={2}
        />

        <directionalLight
          position={[-6, 8, 5]}
          intensity={2.2}
          color="#d6eaff"
        />

        <pointLight
          position={[4, 2, -5]}
          intensity={4}
          color="#557fff"
          distance={18}
        />

        {/* Corazón central N + S */}
        <Heart />

        {/* Planetas y sus órbitas */}
        {planets.map((planet, index) => (
          <PlanetMesh
            key={planet.name}
            planet={planet}
            index={index}
            onSelect={onSelect}
          />
        ))}

        {/* Estrellas del espacio */}
        <Stars
          radius={65}
          depth={45}
          count={2200}
          factor={3}
          saturation={0.18}
          fade
          speed={0.35}
        />

        {/* Polvo estelar suave */}
        <Stars
          radius={28}
          depth={20}
          count={500}
          factor={1.5}
          saturation={0.5}
          fade
          speed={0.15}
        />

        {/* Movimiento suave de cámara */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={9}
          maxDistance={24}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate
          autoRotateSpeed={0.25}
          enableDamping
          dampingFactor={0.05}
        />

      
      </Canvas>
    </>
  )
}
function Login({onLogin}) {
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('')
 async function submit(e){e.preventDefault();setError('');if(!supabaseConfigured){setError('Primero configura la URL y la clave pública de Supabase en .env.local.');return}setBusy(true);const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error)setError('No se pudo iniciar sesión. Revisa el correo y la contraseña.');else onLogin()}
 return <main className="login-shell"><div className="login-stars"/><section className="login-card"><div className="orbit-mark"><span> N + S </span></div><p className="eyebrow">UN LUGAR SOLO NUESTRO</p><h1>Nuestro universo</h1><p className="muted">Hay un pequeño universo esperando por ti.</p><form onSubmit={submit}><label>Correo electrónico<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Tu correo"/></label><label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Tu contraseña"/></label><button disabled={busy}>{busy?'Entrando…':'Entrar a nuestro universo'}</button>{error&&<p className="error">{error}</p>}</form><p className="tiny">Creado con cariño para Nathalie</p></section></main>
}
export default function App(){
 const [session,setSession]=useState(null); const [checked,setChecked]=useState(false); const [showUniverse,setShowUniverse]=useState(false); const [selected,setSelected]=useState(null); const [visited,setVisited]=useState([]); const [secret,setSecret]=useState(false)
 useEffect(()=>{if(!supabaseConfigured){setChecked(true);return}supabase.auth.getSession().then(({data})=>{setSession(data.session);setChecked(true)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));return()=>subscription.unsubscribe()},[])
 async function logout(){await supabase.auth.signOut();setSession(null);setShowUniverse(false)}
 if(!checked)return <div className="loading">Preparando las estrellas…</div>
 if(!session)return <Login onLogin={()=>{setSession({user:{}});setShowUniverse(false)}}/>
 if(!showUniverse)return <main className="welcome"><div className="welcome-glow"/><p className="eyebrow">PARA NATHALIE</p><motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:1.2}}>Así es mi universo<br/><em>desde que estás tú...</em></motion.h1><p className="muted">Cada estrella guarda un pedacito de lo que siento por ti.</p><button onClick={()=>setShowUniverse(true)}>Descubrir nuestra galaxia <span>↗</span></button><button className="quiet" onClick={logout}>Cerrar sesión</button></main>
 return <main className="universe"><header><div><p className="eyebrow">N + S · PARA SIEMPRE EN MI UNIVERSO</p><h1>Nuestro universo de amor</h1></div><button className="logout" onClick={logout}>Salir</button></header><div className="canvas-wrap"><Galaxy onSelect={p=>{setSelected(p);setVisited(v=>v.includes(p.name)?v:[...v,p.name])}}/><div className="heart-label">N <span>+</span> S</div><p className="orbit-hint">Selecciona un planeta para descubrir su mensaje</p></div><section className="planet-strip">{planets.map(p=><button key={p.name} className={selected?.name===p.name?'planet-chip active':'planet-chip'} onClick={()=>{setSelected(p);setVisited(v=>v.includes(p.name)?v:[...v,p.name])}}><i style={{background:p.color}}/>{p.name}</button>)}</section><AnimatePresence>{selected&&<motion.div className="message-panel" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:18}}><button className="close" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">UN MENSAJE DESDE {selected.name.toUpperCase()}</p><h2>{selected.name}</h2><p>{selected.phrase}</p></motion.div>}</AnimatePresence><section className="secret-area"><p>{visited.length} de 8 planetas descubiertos</p><div className="progress"><span style={{width:`${visited.length/8*100}%`}}/></div>{visited.length===8&&!secret&&<button onClick={()=>setSecret(true)}>Un último secreto para ti</button>}{secret&&<div className="final-note"><p className="eyebrow">MI ÚLTIMO SECRETO</p><p>{FINAL_DEDICATION}</p><span className="signature">Con amor, N + S</span></div>}</section></main>
}