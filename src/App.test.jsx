import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// App fires a celebratory canvas-confetti animation once the assigned
// amounts exactly match the bill. jsdom doesn't implement a real 2D canvas
// context, so canvas-confetti's requestAnimationFrame loop throws when it
// tries to draw -- irrelevant to the split math these tests cover, so it's
// stubbed out.
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// These exercise the real <App /> + useBilling wiring (not a reimplemented
// copy of the math), specifically the proportional "Individual" split path
// described in ARCHITECTURE.md: each person's tip/tax share is proportional
// to their share of the subtotal, and the UI must flag when the assigned
// amounts don't add up to the bill.
describe('App - proportional ("Individual") split', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const openIndividualSplit = (billAmount) => {
    render(<App />);
    const billInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(billInput, { target: { value: String(billAmount) } });
    fireEvent.click(screen.getByRole('button', { name: '0%' })); // keep the math simple
    fireEvent.click(screen.getByRole('button', { name: 'Individual' }));
    return document.querySelector('.modal-content');
  };

  it('shows no "Falta por asignar" warning once the full bill is assigned to one person', () => {
    const modal = openIndividualSplit(100);

    const amountInput = within(modal).getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });

    // The modal's own indicator ("Por asignar: $0.00") and the summary
    // panel's warning (only rendered once |remainingAmount| > 0.01) should
    // both reflect a fully-assigned bill.
    expect(within(modal).getByText('$0.00')).toBeInTheDocument();
    expect(screen.queryByText('Falta por asignar')).not.toBeInTheDocument();

    fireEvent.click(within(modal).getByRole('button', { name: 'Listo' }));

    // The default person ("Tú") should be charged exactly the bill total.
    const personRow = screen.getByText(/Tú/).closest('div');
    expect(within(personRow).getByText('$100.00')).toBeInTheDocument();
  });

  it('flags the exact remaining amount when consumption is under-assigned', () => {
    const modal = openIndividualSplit(100);

    const amountInput = within(modal).getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '60' } }); // only $60 of $100 assigned

    // Modal's live indicator ("Por asignar:").
    expect(within(modal).getByText('$40.00')).toBeInTheDocument();
    // Summary panel's warning, outside the modal.
    expect(screen.getByText('Falta por asignar')).toBeInTheDocument();
  });

  it('splits tip/tax proportionally to each person\'s assigned consumption', () => {
    // Bill $100 with a 20% tip ($20) split between two people: $75/$25 (a
    // 75/25 ratio), so the tip should be divided $15/$5, not $10/$10.
    render(<App />);
    const billInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(billInput, { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: '20%' }));
    fireEvent.click(screen.getByRole('button', { name: 'Individual' }));

    const modal = document.querySelector('.modal-content');
    const firstAmountInput = within(modal).getByPlaceholderText('0.00');
    fireEvent.change(firstAmountInput, { target: { value: '75' } });
    fireEvent.click(within(modal).getByRole('button', { name: /Añadir Persona/ }));

    const amountInputs = within(modal).getAllByPlaceholderText('0.00');
    fireEvent.change(amountInputs[1], { target: { value: '25' } });

    expect(within(modal).queryByText('Falta por asignar')).not.toBeInTheDocument();
    fireEvent.click(within(modal).getByRole('button', { name: 'Listo' }));

    // $75 consumption + 75% of the $20 tip ($15) = $90.
    const personARow = screen.getByText(/Tú/).closest('div');
    expect(within(personARow).getByText('$90.00')).toBeInTheDocument();

    // $25 consumption + 25% of the $20 tip ($5) = $30.
    const personBRow = screen.getByText(/Persona 2/).closest('div');
    expect(within(personBRow).getByText('$30.00')).toBeInTheDocument();
  });
});
