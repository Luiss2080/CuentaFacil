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

  it('handles a single person the same as the full total (1-person edge case)', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(42.5);
      result.current.setTipPercentage(10);
      result.current.setNumPeople(1);
    });

    expect(result.current.equalSplitAmount).toBe(result.current.totalAmount);
  });

  it('keeps the equal split mathematically exact for a repeating-decimal division', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(10);
      result.current.setTipPercentage(0);
      result.current.setTaxPercentage(0);
      result.current.setNumPeople(3); // 10 / 3 = 3.3333... (not exact in binary FP)
    });

    // Multiplying the (unrounded) per-person share back by the number of
    // people must reconstruct the original total to within floating-point
    // epsilon -- i.e. the division itself doesn't silently lose or
    // manufacture money, independent of how the UI later rounds it for
    // display.
    expect(result.current.equalSplitAmount * 3).toBeCloseTo(result.current.totalAmount, 10);
  });

  it('stays precise for an unusually large bill amount', () => {
    const { result } = renderHook(() => useBilling());

    act(() => {
      result.current.setBillAmount(999999999.99);
      result.current.setTipPercentage(0);
      result.current.setTaxPercentage(0);
      result.current.setNumPeople(4);
    });

    expect(result.current.equalSplitAmount * 4).toBeCloseTo(result.current.totalAmount, 6);
  });
});
