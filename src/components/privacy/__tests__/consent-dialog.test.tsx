import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConsentDialog } from '../consent-dialog';

// Local storage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('ConsentDialog', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should render consent dialog when no consent is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ConsentDialog />);
    
    expect(screen.getByText('プライバシーポリシーと利用規約')).toBeInTheDocument();
    expect(screen.getByText('利用規約に同意する')).toBeInTheDocument();
    expect(screen.getByText('個人データの収集と利用に同意する')).toBeInTheDocument();
    expect(screen.getByText('データの保存と処理に同意する')).toBeInTheDocument();
  });

  it('should not render dialog when consent is already given', () => {
    const validConsent = {
      timestamp: Date.now(),
      agreeTerms: true,
      agreeData: true,
      agreeStorage: true,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(validConsent));
    
    const { container } = render(<ConsentDialog />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render dialog when consent is expired', () => {
    const expiredConsent = {
      timestamp: Date.now() - (365 * 24 * 60 * 60 * 1000 + 1), // 1 year + 1ms ago
      agreeTerms: true,
      agreeData: true,
      agreeStorage: true,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredConsent));
    
    render(<ConsentDialog />);
    
    expect(screen.getByText('プライバシーポリシーと利用規約')).toBeInTheDocument();
  });

  it('should enable submit button only when all agreements are checked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ConsentDialog />);
    
    const submitButton = screen.getByText('同意して続ける');
    expect(submitButton).toBeDisabled();
    
    // Check all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('should save consent to localStorage on submit', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ConsentDialog />);
    
    // Check all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    // Submit
    fireEvent.click(screen.getByText('同意して続ける'));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_consent',
        expect.stringContaining('"agreeTerms":true')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_consent',
        expect.stringContaining('"agreeData":true')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user_consent',
        expect.stringContaining('"agreeStorage":true')
      );
    });
  });

  it('should show all consent button when not all agreements are checked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ConsentDialog />);
    
    // Check only one checkbox
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    
    expect(screen.getByText('すべてに同意する')).toBeInTheDocument();
  });

  it('should check all agreements when "agree all" is clicked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ConsentDialog />);
    
    // Click "agree all" button
    fireEvent.click(screen.getByText('すべてに同意する'));
    
    // All checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
    
    // Submit button should be enabled
    expect(screen.getByText('同意して続ける')).not.toBeDisabled();
  });

  it('should display links to privacy policy and terms', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<ConsentDialog />);
    
    const privacyLink = screen.getByText('プライバシーポリシー');
    const termsLink = screen.getByText('利用規約');
    
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(privacyLink).toHaveAttribute('target', '_blank');
    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(termsLink).toHaveAttribute('target', '_blank');
  });
});