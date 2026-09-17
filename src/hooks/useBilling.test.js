import { renderHook, act } from '@testing-library/react';
import { useBilling, getPersonTotal } from './useBilling';
import { describe, it, expect, beforeEach } from 'vitest';

describe('useBilling Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates equal split correctly without tip or tax', () => {
    const { result } = renderHook(() => useBilling());
    
    act(() => {
      result.current.setBillAmount(100);
      result.current.setTipPercentage(0);
      result.current.setTaxPercentage(0);
      result.current.setNumPeople(4);
    });

    expect(result.current.equalSplitAmount).toBe(25);
    expect(result.current.totalAmount).toBe(100);
  });

  it('calculates equal split correctly with tip and tax', () => {
    const { result } = renderHook(() => useBilling());
    
    act(() => {
      result.current.setBillAmount(100); // Subtotal
      result.current.setTipPercentage(15); // $15 tip
      result.current.setTaxPercentage(10); // $10 tax
      result.current.setNumPeople(5);
    });

    // Total = 125, per person = 25
    expect(result.current.totalAmount).toBe(125);
    expect(result.current.equalSplitAmount).toBe(25);
  });

  it('never divides by zero when numPeople is set to 0', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(100);
      result.current.setTipPercentage(0);
      result.current.setNumPeople(0);
    });

    // setNumPeople clamps to a minimum of 1 instead of allowing 0, which
    // would otherwise make equalSplitAmount evaluate to Infinity.
    expect(result.current.numPeople).toBe(1);
    expect(result.current.equalSplitAmount).toBe(100);
    expect(Number.isFinite(result.current.equalSplitAmount)).toBe(true);
  });

  it('clamps a negative numPeople to 1 instead of going negative', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(50);
      result.current.setTipPercentage(0);
      result.current.setNumPeople(-3);
    });

    expect(result.current.numPeople).toBe(1);
    expect(result.current.equalSplitAmount).toBe(50);
  });

  it('rejects a negative bill amount instead of producing a negative total', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(-100);
    });

    expect(result.current.billAmount).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('rejects a non-numeric bill amount (e.g. pasted currency text)', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount('$abc');
    });

    expect(result.current.billAmount).toBe(0);
  });

  it('rejects an unrealistically large bill amount that parses to Infinity', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      // parseFloat('1e400') === Infinity
      result.current.setBillAmount('1e400');
    });

    expect(result.current.billAmount).toBe(0);
  });

  it('rejects a negative tax percentage', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(100);
      result.current.setTaxPercentage(-10);
    });

    expect(result.current.taxPercentage).toBe(0);
    expect(result.current.taxAmount).toBe(0);
  });

  it('rejects a negative tip percentage', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(100);
      result.current.setTipPercentage(-25);
    });

    expect(result.current.tipPercentage).toBe(0);
    expect(result.current.tipAmount).toBe(0);
  });

  it('handles a single person the same as an equal split of 1', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(42.5);
      result.current.setTipPercentage(10);
      result.current.setNumPeople(1);
    });

    expect(result.current.equalSplitAmount).toBe(result.current.totalAmount);
  });
});

describe('getPersonTotal (proportional/advanced split)', () => {
  it('gives a person their raw amount plus their proportional share of tip and tax', () => {
    // Bill $100, tip $10, tax $5 -> total $115. Person consumed $40 (40% ratio).
    const total = getPersonTotal(40, { billAmount: 100, tipAmount: 10, taxAmount: 5 });
    expect(total).toBeCloseTo(40 + 10 * 0.4 + 5 * 0.4, 10); // 46
  });

  it('returns just the raw amount when billAmount is 0 (nothing to prorate)', () => {
    const total = getPersonTotal(25, { billAmount: 0, tipAmount: 10, taxAmount: 5 });
    expect(total).toBe(25);
  });

  it('treats a negative assigned amount as 0 instead of subtracting from the split', () => {
    const total = getPersonTotal(-20, { billAmount: 100, tipAmount: 10, taxAmount: 0 });
    expect(total).toBe(0);
  });

  it('sums back to the grand total when individual amounts are correctly assigned', () => {
    // Two people split a $100 bill with $15 tip and $10 tax exactly: $60 + $40.
    const billAmount = 100, tipAmount = 15, taxAmount = 10;
    const totalAmount = billAmount + tipAmount + taxAmount;
    const personA = getPersonTotal(60, { billAmount, tipAmount, taxAmount });
    const personB = getPersonTotal(40, { billAmount, tipAmount, taxAmount });
    expect(personA + personB).toBeCloseTo(totalAmount, 10);
  });

  it('is proportionally consistent (but does not itself validate) when amounts are under-assigned', () => {
    // Only $70 of a $100 bill assigned between two people -> the UI is
    // responsible for flagging the $30 gap ("Falta por asignar"); the math
    // helper just keeps prorating whatever ratio it's given.
    const billAmount = 100, tipAmount = 15, taxAmount = 10;
    const personA = getPersonTotal(50, { billAmount, tipAmount, taxAmount });
    const personB = getPersonTotal(20, { billAmount, tipAmount, taxAmount });
    expect(personA + personB).toBeLessThan(billAmount + tipAmount + taxAmount);
  });
});
