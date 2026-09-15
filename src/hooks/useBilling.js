import { useState, useEffect } from 'react';

export const useBilling = () => {
  const [billAmount, setBillAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'advanced'
  
  // people: [{ id: 1, name: 'Person 1', amount: 0 }] for advanced, or just a number for equal
  const [numPeople, setNumPeople] = useState(1);
  const [people, setPeople] = useState([
    { id: 1, name: 'You', amount: 0 }
  ]);

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
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('splitit_pro_state', JSON.stringify({
      billAmount, tipPercentage, taxPercentage, currency, splitMode, numPeople, people
    }));
  }, [billAmount, tipPercentage, taxPercentage, currency, splitMode, numPeople, people]);

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
    taxAmount,
    tipAmount,
    totalAmount,
    equalSplitAmount
  };
};
