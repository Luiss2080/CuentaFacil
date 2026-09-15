import { renderHook, act } from '@testing-library/react';
import { useBilling } from './useBilling';
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
});
