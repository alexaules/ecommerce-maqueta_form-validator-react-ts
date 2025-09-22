import React, { useMemo, useState } from 'react'
import { isNonEmpty, isEmail, passwordStrength, isSameAs, isAdult, isNumber, inRange, optional } from './validators'

type FormState = {
  nombre: string
  email: string
  password: string
  confirm: string
  nacimiento: string
  cantidad: string
  telefono?: string
  website?: string
  terminos: boolean
}

const initial: FormState = {
  nombre: '',
  email: '',
  password: '',
  confirm: '',
  nacimiento: '',
  cantidad: '',
  telefono: '',
  website: '',
  terminos: false,
}

export default function App(){
  const [form, setForm] = useState<FormState>(initial)
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    nombre:false, email:false, password:false, confirm:false, nacimiento:false, cantidad:false, telefono:false, website:false, terminos:false
  })
  const [submitted, setSubmitted] = useState(false)
  const passMeta = useMemo(()=>passwordStrength(form.password), [form.password])

  const validators = {
    nombre: (v:string)=> isNonEmpty(v),
    email: (v:string)=> isEmail(v),
    password: (v:string)=> passMeta.error,
    confirm: (v:string)=> isSameAs(form.password)(v),
    nacimiento: (v:string)=> isAdult(v, 18),
    cantidad: (v:string)=> {
      const e1 = isNumber(v)
      if (e1) return e1
      return inRange(1, 1000)(v)
    },
    telefono: optional((v:string)=> /^\+?\d{7,15}$/.test(v) ? null : 'Teléfono inválido. Solo dígitos y opcional +'),
    website: optional((v:string)=> /^https?:\/\//i.test(v) ? null : 'La URL debe iniciar con http:// o https://'),
    terminos: (v:boolean)=> v ? null : 'Debes aceptar los términos.'
  } as const

  const errors: Record<keyof FormState, string | null> = {
    nombre: validators.nombre(form.nombre),
    email: validators.email(form.email),
    password: validators.password(form.password),
    confirm: validators.confirm(form.confirm),
    nacimiento: validators.nacimiento(form.nacimiento),
    cantidad: validators.cantidad(form.cantidad),
    telefono: validators.telefono(form.telefono || ''),
    website: validators.website(form.website || ''),
    terminos: validators.terminos(form.terminos)
  }

  const allValid = Object.values(errors).every(e => e === null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]){
    setForm(prev => ({...prev, [key]: value }))
  }
  function markTouched<K extends keyof FormState>(key: K){
    setTouched(prev => ({...prev, [key]: true}))
  }

  function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setSubmitted(true)
    setTouched({
      nombre:true, email:true, password:true, confirm:true, nacimiento:true, cantidad:true, telefono:true, website:true, terminos:true
    })
    if (allValid){
      alert('Formulario válido. Datos listos para enviar.')
      console.log('Datos del formulario:', form)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <header className="row" style={{justifyContent:'space-between'}}>
          <div>
            <h1>Validador de Formularios</h1>
            <p className="lead">React + TypeScript • Validación en tiempo real con mensajes claros.</p>
            <div className="row" style={{gap:8}}>
              <span className="badge">ES2020</span>
              <span className="badge">TypeScript</span>
              <span className="badge">Accesible</span>
              <span className="badge">Vite</span>
            </div>
          </div>
        </header>

        {submitted && !allValid && (
          <div className="alert error">
            Hay errores en el formulario. Revisa los campos marcados en rojo.
          </div>
        )}
        {submitted && allValid && (
          <div className="alert success">
            ¡Todo correcto! Puedes enviar los datos.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid">
            <div>
              <label htmlFor="nombre">Nombre completo *</label>
              <input id="nombre" className="input" value={form.nombre}
                onChange={e=>set('nombre', e.target.value)}
                onBlur={()=>markTouched('nombre')} placeholder="Ej. Ana Pérez" required/>
              {touched.nombre && (errors.nombre ? <div className="msg error">{errors.nombre}</div> : <div className="msg ok">Se ve bien.</div>)}
            </div>

            <div>
              <label htmlFor="email">Correo electrónico *</label>
              <input id="email" type="email" className="input" value={form.email}
                onChange={e=>set('email', e.target.value)}
                onBlur={()=>markTouched('email')} placeholder="ana@ejemplo.com" required/>
              {touched.email && (errors.email ? <div className="msg error">{errors.email}</div> : <div className="msg ok">Correo válido.</div>)}
            </div>

            <div>
              <label htmlFor="password">Contraseña *</label>
              <input id="password" type="password" className="input" value={form.password}
                onChange={e=>set('password', e.target.value)}
                onBlur={()=>markTouched('password')} placeholder="Mín. 8 caracteres" required aria-describedby="pwd-hint"/>
              <div id="pwd-hint" className="hint">Usa mayúsculas, números y símbolos.</div>
              <div className={['strength', passMeta.level].join(' ')} aria-hidden>
                <div />
              </div>
              {touched.password && (errors.password ? <div className="msg error">{errors.password}</div> : <div className="msg ok">Contraseña robusta.</div>)}
            </div>

            <div>
              <label htmlFor="confirm">Confirmar contraseña *</label>
              <input id="confirm" type="password" className="input" value={form.confirm}
                onChange={e=>set('confirm', e.target.value)}
                onBlur={()=>markTouched('confirm')} placeholder="Repite la contraseña" required/>
              {touched.confirm && (errors.confirm ? <div className="msg error">{errors.confirm}</div> : <div className="msg ok">Coinciden.</div>)}
            </div>

            <div>
              <label htmlFor="nacimiento">Fecha de nacimiento *</label>
              <input id="nacimiento" type="date" className="input" value={form.nacimiento}
                onChange={e=>set('nacimiento', e.target.value)}
                onBlur={()=>markTouched('nacimiento')} required/>
              {touched.nacimiento && (errors.nacimiento ? <div className="msg error">{errors.nacimiento}</div> : <div className="msg ok">Fecha válida.</div>)}
            </div>

            <div>
              <label htmlFor="cantidad">Cantidad (1—1000) *</label>
              <input id="cantidad" inputMode="decimal" className="input" value={form.cantidad}
                onChange={e=>set('cantidad', e.target.value)}
                onBlur={()=>markTouched('cantidad')} placeholder="Ej. 5" required/>
              {touched.cantidad && (errors.cantidad ? <div className="msg error">{errors.cantidad}</div> : <div className="msg ok">Cantidad válida.</div>)}
            </div>

            <div>
              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input id="telefono" className="input" value={form.telefono}
                onChange={e=>set('telefono', e.target.value)}
                onBlur={()=>markTouched('telefono')} placeholder="+34123456789"/>
              {touched.telefono && (errors.telefono ? <div className="msg error">{errors.telefono}</div> : form.telefono ? <div className="msg ok">Teléfono válido.</div> : <div className="hint">Puedes dejarlo vacío.</div>)}
            </div>

            <div>
              <label htmlFor="website">Website (opcional)</label>
              <input id="website" className="input" value={form.website}
                onChange={e=>set('website', e.target.value)}
                onBlur={()=>markTouched('website')} placeholder="https://tu-dominio.com"/>
              {touched.website && (errors.website ? <div className="msg error">{errors.website}</div> : form.website ? <div className="msg ok">URL válida.</div> : <div className="hint">Puedes dejarlo vacío.</div>)}
            </div>
          </div>

          <fieldset style={{marginTop:12}}>
            <legend>Consentimiento</legend>
            <label className="row" htmlFor="terminos">
              <input id="terminos" type="checkbox" checked={form.terminos} onChange={e=>set('terminos', e.target.checked)} onBlur={()=>markTouched('terminos')}/>
              <span>Acepto los términos y condiciones *</span>
            </label>
            {touched.terminos && (errors.terminos ? <div className="msg error">{errors.terminos}</div> : <div className="msg ok">¡Gracias por aceptar!</div>)}
          </fieldset>

          <div className="row" style={{justifyContent:'space-between', marginTop:16}}>
            <button type="button" onClick={()=>{ 
              setForm(initial); 
              setTouched({nombre:false, email:false, password:false, confirm:false, nacimiento:false, cantidad:false, telefono:false, website:false, terminos:false}); 
              setSubmitted(false)
            }}>Limpiar</button>
            <button type="submit">Enviar</button>
          </div>
        </form>

        <footer>
          Campos marcados con * son obligatorios. Mensajes de error/confirmación aparecen en tiempo real.
        </footer>
      </div>
    </div>
  )
}
