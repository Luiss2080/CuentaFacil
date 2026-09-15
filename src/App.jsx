import { useState } from 'react'
import './index.css'
import { useBilling } from './hooks/useBilling'

function App() {
  const {
    billAmount, setBillAmount,
    tipPercentage, setTipPercentage,
    taxPercentage, setTaxPercentage,
    currency, setCurrency,
    numPeople, setNumPeople,
    taxAmount, tipAmount, totalAmount, equalSplitAmount
  } = useBilling();

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

  return (
    <div className="glass-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SplitIt Pro
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Dividí la cuenta sin estrés</p>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
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
                style={{ paddingLeft: '2rem' }}
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

          <div>
            <label>Dividir entre</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="secondary" onClick={() => handlePeopleChange(-1)}>-</button>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', width: '2ch', textAlign: 'center' }}>{numPeople}</span>
              <button className="secondary" onClick={() => handlePeopleChange(1)}>+</button>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: 'var(--card-radius)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Resumen</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Propina</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(tipAmount)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(totalAmount)}</span>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>Por persona</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent-color)' }}>{formatCurrency(equalSplitAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
