import { useState, useEffect } from 'react';

// Key used to persist/restore the whole billing state in localStorage.
// Named once so the getItem/setItem calls below can't drift out of sync.
const LOCAL_STORAGE_KEY = 'splitit_pro_state';

// Tip percentage applied on first load, and restored if a saved state is
// missing one (e.g. an older/partial localStorage payload).
const DEFAULT_TIP_PERCENTAGE = 15;

export const useBilling = () => {
  const [billAmount, setBillAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(DEFAULT_TIP_PERCENTAGE);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'advanced'
  
  const [numPeople, setNumPeople] = useState(1);
  const [people, setPeople] = useState([
    { id: 1, name: 'Tú', amount: 0, avatar: '😎' }
  ]);
  const [history, setHistory] = useState([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBillAmount(parsed.billAmount || 0);
        setTipPercentage(parsed.tipPercentage || DEFAULT_TIP_PERCENTAGE);
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      billAmount, tipPercentage, taxPercentage, currency, splitMode, numPeople, people, history
    }));
  }, [billAmount, tipPercentage, taxPercentage, currency, splitMode, numPeople, people, history]);

  const taxAmount = billAmount * (taxPercentage / 100);
  const tipAmount = billAmount * (tipPercentage / 100);
  const totalAmount = billAmount + taxAmount + tipAmount;

  const equalSplitAmount = totalAmount / numPeople;

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
