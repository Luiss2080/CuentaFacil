import { useState, useRef, useEffect } from 'react';
import './index.css';
import { useBilling, getPersonTotal } from './hooks/useBilling';
import Modal from './components/Modal';
import { Settings, Download, Plus, Trash2, Users, History, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const AVATARS = ['😎', '👽', '🤠', '🤖', '👻', '😺', '🦄', '🦖'];

// Quick-select tip percentage buttons shown under "Propina (%)".
const TIP_PRESETS = [0, 10, 15, 20, 25];

// How many past receipts the "Historial" panel keeps.
const MAX_HISTORY_ENTRIES = 10;

// Amounts are only ever off by binary floating-point noise (e.g. 0.1 + 0.2),
// never by a real, meaningful fraction of a cent, so anything under this is
// treated as "fully assigned"/"matched" rather than a real discrepancy.
const AMOUNT_MATCH_TOLERANCE = 0.01;

// canvas-confetti options for the two celebratory moments in the app.
const CONFETTI_SAVED_RECEIPT = { particleCount: 100, spread: 70, origin: { y: 0.6 } };
const CONFETTI_SPLIT_FULLY_ASSIGNED = { particleCount: 50, spread: 60, origin: { y: 0.8 } };

function App() {
  const {
    billAmount, setBillAmount,
    tipPercentage, setTipPercentage,
    taxPercentage, setTaxPercentage,
    currency, setCurrency,
    splitMode, setSplitMode,
    numPeople, setNumPeople,
    people, setPeople,
    history, setHistory,
    taxAmount, tipAmount, totalAmount, equalSplitAmount
  } = useBilling();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvancedSplitOpen, setIsAdvancedSplitOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const summaryRef = useRef(null);

  const handleBillChange = (e) => {
    // setBillAmount sanitizes (rejects negative/NaN/Infinity) internally,
    // so the raw string can be passed straight through.
    setBillAmount(e.target.value);
  };

  const handleTipChange = (tip) => setTipPercentage(tip);
  
  const handlePeopleChange = (delta) => {
    setNumPeople(prev => Math.max(1, prev + delta));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleExport = async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: document.documentElement.style.getPropertyValue('--bg-color') || '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'splitit-pro-receipt.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const saveToHistory = () => {
    if (billAmount > 0) {
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        amount: totalAmount,
        currency,
        peopleCount: splitMode === 'equal' ? numPeople : people.length
      };
      setHistory([newRecord, ...history].slice(0, MAX_HISTORY_ENTRIES));
      confetti(CONFETTI_SAVED_RECEIPT);
    }
  };

  const addPerson = () => {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setPeople([...people, { id: Date.now(), name: `Persona ${people.length + 1}`, amount: 0, avatar: randomAvatar }]);
  };

  const removePerson = (id) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updatePerson = (id, field, value) => {
    // Individually-assigned consumption can't be negative: a negative
    // share would silently increase everyone else's proportional tip/tax.
    const safeValue = field === 'amount' ? Math.max(0, value) : value;
    setPeople(people.map(p => p.id === id ? { ...p, [field]: safeValue } : p));
  };

  const changeAvatar = (id) => {
    setPeople(people.map(p => {
      if (p.id === id) {
        const currentIndex = AVATARS.indexOf(p.avatar);
        const nextIndex = (currentIndex + 1) % AVATARS.length;
        return { ...p, avatar: AVATARS[nextIndex] };
      }
      return p;
    }));
  };

  const allocatedAmount = people.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remainingAmount = billAmount - allocatedAmount;
  
  useEffect(() => {
    if (isAdvancedSplitOpen && billAmount > 0 && Math.abs(remainingAmount) < AMOUNT_MATCH_TOLERANCE) {
      confetti(CONFETTI_SPLIT_FULLY_ASSIGNED);
    }
  }, [remainingAmount, isAdvancedSplitOpen, billAmount]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel" 
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SplitIt Pro
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Divide la cuenta sin estrés</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="icon-button" onClick={() => setIsHistoryOpen(true)} aria-label="Ver historial de cuentas">
            <History size={24} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="icon-button" onClick={() => setIsSettingsOpen(true)} aria-label="Abrir configuración">
            <Settings size={24} />
          </motion.button>
        </div>
      </header>

      {/* min(280px, 100%) instead of a bare 280px: on a narrow phone
          (e.g. 375px wide, ~247px left after the outer padding) a hard
          280px track minimum doesn't fit and forces the whole panel into
          horizontal scroll. Capping the minimum at 100% of the available
          space lets the grid collapse to a single column instead. */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="bill-amount">Monto de la cuenta</label>
            <div style={{ position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
              <input
                id="bill-amount"
                type="number"
                value={billAmount || ''}
                onChange={handleBillChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{ paddingLeft: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}
              />
            </div>
          </div>

          <div role="group" aria-label="Propina (%)">
            <label id="tip-group-label">Propina (%)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {TIP_PRESETS.map(tip => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={tip}
                  type="button"
                  className={tipPercentage === tip ? 'primary' : 'secondary'}
                  onClick={() => handleTipChange(tip)}
                  aria-pressed={tipPercentage === tip}
                  style={{ padding: '0.5rem' }}
                >
                  {tip}%
                </motion.button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div role="group" aria-label="Modo de división">
              <label id="split-mode-label">Modo de división</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className={splitMode === 'equal' ? 'primary' : 'secondary'}
                  onClick={() => setSplitMode('equal')}
                  aria-pressed={splitMode === 'equal'}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Partes Iguales
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className={splitMode === 'advanced' ? 'primary' : 'secondary'}
                  onClick={() => { setSplitMode('advanced'); setIsAdvancedSplitOpen(true); }}
                  aria-pressed={splitMode === 'advanced'}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Individual
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {splitMode === 'equal' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ textAlign: 'right' }}
                >
                  <label id="people-count-label">Personas</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" className="secondary" onClick={() => handlePeopleChange(-1)} aria-label="Restar una persona" style={{ padding: '0.25rem 0.75rem' }}>-</button>
                    <span aria-labelledby="people-count-label" style={{ fontSize: '1.25rem', fontWeight: 'bold', width: '2ch', textAlign: 'center' }}>{numPeople}</span>
                    <button type="button" className="secondary" onClick={() => handlePeopleChange(1)} aria-label="Añadir una persona" style={{ padding: '0.25rem 0.75rem' }}>+</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          layout
          ref={summaryRef}
          role="region"
          aria-label="Resumen de la cuenta"
          aria-live="polite"
          style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: 'var(--card-radius)', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Resumen</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="icon-button" onClick={saveToHistory} title="Guardar cuenta" aria-label="Guardar cuenta en el historial">
                <Plus size={20} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="icon-button" onClick={handleExport} title="Descargar como imagen" aria-label="Descargar recibo como imagen PNG">
                <Download size={20} />
              </motion.button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>{formatCurrency(billAmount)}</span>
          </div>
          
          <AnimatePresence>
            {taxPercentage > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Impuestos ({taxPercentage}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Propina ({tipPercentage}%)</span>
            <span>{formatCurrency(tipAmount)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <span>Total a pagar</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            {splitMode === 'equal' ? (
              <motion.div 
                key="equal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>Por persona ({numPeople})</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-color)' }}>{formatCurrency(equalSplitAmount)}</span>
              </motion.div>
            ) : (
              <motion.div 
                key="advanced"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Desglose Individual</h3>
                  <button onClick={() => setIsAdvancedSplitOpen(true)} className="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Editar</button>
                </div>
                {people.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{p.avatar} {p.name}</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(getPersonTotal(p.amount, { billAmount, tipAmount, taxAmount }))}</span>
                  </div>
                ))}
                {Math.abs(remainingAmount) > AMOUNT_MATCH_TOLERANCE && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                    <span>Falta por asignar</span>
                    <span>{formatCurrency(remainingAmount)}</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Configuración">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="currency-select">Moneda</label>
            <select
              id="currency-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--input-radius)', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="BOB">BOB (Bs.)</option>
              <option value="MXN">MXN ($)</option>
            </select>
          </div>
          <div>
            <label htmlFor="tax-percentage">Impuestos Locales (%)</label>
            <input
              id="tax-percentage"
              type="number"
              value={taxPercentage}
              onChange={e => setTaxPercentage(e.target.value)}
              min="0"
            />
          </div>
          <button className="primary" onClick={() => setIsSettingsOpen(false)} style={{ width: '100%' }}>Guardar</button>
        </div>
      </Modal>

      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Historial">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay recibos guardados.</p>
          ) : (
            <AnimatePresence>
              {history.map(record => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--input-radius)', border: '1px solid var(--glass-border)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: record.currency }).format(record.amount)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12}/> {record.date} • <Users size={12}/> {record.peopleCount} pers.
                    </span>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setHistory(history.filter(h => h.id !== record.id))}
                    aria-label={`Eliminar recibo de ${new Intl.NumberFormat('en-US', { style: 'currency', currency: record.currency }).format(record.amount)} del ${record.date}`}
                    style={{ color: 'var(--danger-color)' }}
                  >
                    <Trash2 size={16}/>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </Modal>

      <Modal isOpen={isAdvancedSplitOpen} onClose={() => setIsAdvancedSplitOpen(false)} title="Asignación Individual">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <motion.div
            animate={{ backgroundColor: Math.abs(remainingAmount) < AMOUNT_MATCH_TOLERANCE ? 'var(--success-color)' : 'var(--accent-light)' }}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderRadius: 'var(--input-radius)' }}
          >
            <span style={{ color: Math.abs(remainingAmount) < AMOUNT_MATCH_TOLERANCE ? 'white' : 'inherit' }}>Por asignar:</span>
            <span style={{ fontWeight: 'bold', color: Math.abs(remainingAmount) < AMOUNT_MATCH_TOLERANCE ? 'white' : remainingAmount < 0 ? 'var(--danger-color)' : 'var(--text-primary)' }}>
              {formatCurrency(remainingAmount)}
            </span>
          </motion.div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
            <AnimatePresence>
              {people.map(p => (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <button
                    onClick={() => changeAvatar(p.id)}
                    aria-label={`Cambiar avatar de ${p.name || 'persona'}`}
                    style={{ background: 'var(--bg-color)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: 'var(--input-radius)', fontSize: '1.25rem' }}
                  >
                    {p.avatar}
                  </button>
                  <input
                    type="text"
                    value={p.name}
                    onChange={e => updatePerson(p.id, 'name', e.target.value)}
                    placeholder="Nombre"
                    aria-label="Nombre de la persona"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={p.amount === 0 ? '' : p.amount}
                    onChange={e => updatePerson(p.id, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    aria-label={`Monto consumido por ${p.name || 'persona'}`}
                    min="0"
                    step="0.01"
                    style={{ width: '80px' }}
                  />
                  <button className="icon-button" onClick={() => removePerson(p.id)} aria-label={`Quitar a ${p.name || 'persona'}`} style={{ color: 'var(--danger-color)' }}>
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <button className="secondary" onClick={addPerson} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Añadir Persona
          </button>
          <button className="primary" onClick={() => setIsAdvancedSplitOpen(false)}>Listo</button>
        </div>
      </Modal>
    </motion.div>
  )
}

export default App
