import { useState, useEffect } from 'react';

export const useBilling = () => {
  const [billAmount, setBillAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(15);
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
