import { useState, useEffect } from 'react';

// Coerces user/localStorage input into a finite number >= 0. Rejects NaN,
// Infinity (e.g. from "1e400") and negative values, which otherwise
// propagate into negative subtotals/tips/taxes or Infinity/NaN totals.
const sanitizeNonNegativeNumber = (value, fallback = 0) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

// Coerces into a positive integer >= 1, guarding equalSplitAmount against
// division by zero (or by a negative/fractional number of people).
const sanitizePositiveInteger = (value, fallback = 1) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(num) && num >= 1 ? Math.floor(num) : fallback;
};

// Pure helper for the proportional ("Individual") split: a person's share
// of tip/tax is proportional to their share of the subtotal. Exported so
// the math can be unit-tested without rendering <App />.
export const getPersonTotal = (personAmount, { billAmount, tipAmount, taxAmount }) => {
  const amount = sanitizeNonNegativeNumber(personAmount);
  const ratio = billAmount > 0 ? amount / billAmount : 0;
  const personTip = tipAmount * ratio;
  const personTax = taxAmount * ratio;
  return amount + personTip + personTax;
};

export const useBilling = () => {
  const [billAmount, setBillAmountRaw] = useState(0);
  const [tipPercentage, setTipPercentageRaw] = useState(15);
  const [taxPercentage, setTaxPercentageRaw] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'advanced'

  const [numPeople, setNumPeopleRaw] = useState(1);
  const [people, setPeople] = useState([
    { id: 1, name: 'Tú', amount: 0, avatar: '😎' }
  ]);
  const [history, setHistory] = useState([]);

  // Sanitizing wrappers: every entry point into these four fields (typed
  // input, +/- steppers, or a bad value restored from localStorage) is
  // funneled through the same guards, so callers can't bypass them.
  const setBillAmount = (value) => setBillAmountRaw(prev =>
    sanitizeNonNegativeNumber(typeof value === 'function' ? value(prev) : value)
  );
  const setTipPercentage = (value) => setTipPercentageRaw(prev =>
    sanitizeNonNegativeNumber(typeof value === 'function' ? value(prev) : value)
  );
  const setTaxPercentage = (value) => setTaxPercentageRaw(prev =>
    sanitizeNonNegativeNumber(typeof value === 'function' ? value(prev) : value)
  );
  const setNumPeople = (value) => setNumPeopleRaw(prev =>
    sanitizePositiveInteger(typeof value === 'function' ? value(prev) : value)
  );

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('splitit_pro_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBillAmount(parsed.billAmount || 0);
        setTipPercentage(parsed.tipPercentage || 15);
        setTaxPercentage(parsed.taxPercentage || 0);
        setCurrency(parsed.currency || 'USD');
        setSplitMode(parsed.splitMode || 'equal');
        setNumPeople(parsed.numPeople || 1);
        if (parsed.people) setPeople(parsed.people);
        if (parsed.history) setHistory(parsed.history);
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('splitit_pro_state', JSON.stringify({
      billAmount, tipPercentage, taxPercentage, currency, splitMode, numPeople, people, history
    }));
  }, [billAmount, tipPercentage, taxPercentage, currency, splitMode, numPeople, people, history]);

  const taxAmount = billAmount * (taxPercentage / 100);
  const tipAmount = billAmount * (tipPercentage / 100);
  const totalAmount = billAmount + taxAmount + tipAmount;

  // numPeople is already guarded to be >= 1 by setNumPeople, but the
  // division stays guarded here too so this can never render Infinity/NaN
  // even if numPeople is ever driven to 0 by a future caller.
  const equalSplitAmount = numPeople > 0 ? totalAmount / numPeople : 0;

  return {
    billAmount, setBillAmount,
    tipPercentage, setTipPercentage,
    taxPercentage, setTaxPercentage,
    currency, setCurrency,
    splitMode, setSplitMode,
    numPeople, setNumPeople,
    people, setPeople,
    history, setHistory,
    taxAmount,
    tipAmount,
    totalAmount,
    equalSplitAmount
  };
};
