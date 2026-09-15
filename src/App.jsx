import { useState, useRef } from 'react';
import './index.css';
import { useBilling } from './hooks/useBilling';
import Modal from './components/Modal';
import { Settings, Share2, Users, Download, Plus, Trash2, Edit2 } from 'lucide-react';
import html2canvas from 'html2canvas';

function App() {
  const {
    billAmount, setBillAmount,
    tipPercentage, setTipPercentage,
    taxPercentage, setTaxPercentage,
    currency, setCurrency,
    splitMode, setSplitMode,
    numPeople, setNumPeople,
    people, setPeople,
    taxAmount, tipAmount, totalAmount, equalSplitAmount
  } = useBilling();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvancedSplitOpen, setIsAdvancedSplitOpen] = useState(false);
  const summaryRef = useRef(null);

  const handleBillChange = (e) => {
    const val = parseFloat(e.target.value);
    setBillAmount(isNaN(val) ? 0 : val);
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

  const addPerson = () => {
    setPeople([...people, { id: Date.now(), name: `Person ${people.length + 1}`, amount: 0 }]);
  };

  const removePerson = (id) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updatePerson = (id, field, value) => {
    setPeople(people.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Calculate advanced split remaining
  const allocatedAmount = people.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remainingAmount = billAmount - allocatedAmount;
  
  // Calculate individual totals (proportional tip and tax)
  const getPersonTotal = (amount) => {
    const ratio = billAmount > 0 ? amount / billAmount : 0;
    const personTip = tipAmount * ratio;
    const personTax = taxAmount * ratio;
    return amount + personTip + personTax;
  };

  return (
    <div className="glass-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SplitIt Pro
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Divide la cuenta sin estrés</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="icon-button" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={24} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label>Monto de la cuenta</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
              <input 
                type="number" 
                value={billAmount || ''} 
                onChange={handleBillChange} 
                placeholder="0.00"
                style={{ paddingLeft: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}
              />
            </div>
          </div>

          <div>
            <label>Propina (%)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {[0, 10, 15, 20, 25].map(tip => (
                <button 
                  key={tip}
                  className={tipPercentage === tip ? 'primary' : 'secondary'}
                  onClick={() => handleTipChange(tip)}
                  style={{ padding: '0.5rem' }}
                >
                  {tip}%
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label>Modo de división</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  className={splitMode === 'equal' ? 'primary' : 'secondary'}
                  onClick={() => setSplitMode('equal')}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Partes Iguales
                </button>
                <button 
                  className={splitMode === 'advanced' ? 'primary' : 'secondary'}
                  onClick={() => { setSplitMode('advanced'); setIsAdvancedSplitOpen(true); }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Individual
                </button>
              </div>
            </div>
            
            {splitMode === 'equal' && (
              <div style={{ textAlign: 'right' }}>
                <label>Personas</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="secondary" onClick={() => handlePeopleChange(-1)} style={{ padding: '0.25rem 0.75rem' }}>-</button>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', width: '2ch', textAlign: 'center' }}>{numPeople}</span>
                  <button className="secondary" onClick={() => handlePeopleChange(1)} style={{ padding: '0.25rem 0.75rem' }}>+</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div ref={summaryRef} style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: 'var(--card-radius)', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Resumen</h2>
            <button className="icon-button" onClick={handleExport} title="Descargar como imagen">
              <Download size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>{formatCurrency(billAmount)}</span>
          </div>
          
          {taxPercentage > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Impuestos ({taxPercentage}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>Por persona ({numPeople})</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-color)' }}>{formatCurrency(equalSplitAmount)}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Desglose Individual</h3>
                {people.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14}/> {p.name}</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(getPersonTotal(parseFloat(p.amount) || 0))}</span>
                  </div>
                ))}
                {remainingAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
                    <span>Falta por asignar</span>
                    <span>{formatCurrency(remainingAmount)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Configuración">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label>Moneda</label>
            <select 
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
            <label>Impuestos Locales (%)</label>
            <input 
              type="number" 
              value={taxPercentage} 
              onChange={e => setTaxPercentage(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
          <button className="primary" onClick={() => setIsSettingsOpen(false)} style={{ width: '100%' }}>Guardar</button>
        </div>
      </Modal>

      {/* Advanced Split Modal */}
      <Modal isOpen={isAdvancedSplitOpen} onClose={() => setIsAdvancedSplitOpen(false)} title="Asignación Individual">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--accent-light)', padding: '1rem', borderRadius: 'var(--input-radius)' }}>
            <span>Por asignar:</span>
            <span style={{ fontWeight: 'bold', color: remainingAmount === 0 ? 'var(--success-color)' : remainingAmount < 0 ? 'var(--danger-color)' : 'var(--text-primary)' }}>
              {formatCurrency(remainingAmount)}
            </span>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
            {people.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={p.name} 
                  onChange={e => updatePerson(p.id, 'name', e.target.value)}
                  placeholder="Nombre"
                  style={{ flex: 1 }}
                />
                <input 
                  type="number" 
                  value={p.amount || ''} 
                  onChange={e => updatePerson(p.id, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  style={{ width: '100px' }}
                />
                <button className="icon-button" onClick={() => removePerson(p.id)} style={{ color: 'var(--danger-color)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <button className="secondary" onClick={addPerson} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Añadir Persona
          </button>
          <button className="primary" onClick={() => setIsAdvancedSplitOpen(false)}>Listo</button>
        </div>
      </Modal>
    </div>
  )
}

export default App
