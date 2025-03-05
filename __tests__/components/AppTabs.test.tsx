import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppTabs from '@/components/layout/AppTabs';
import { useRouter, usePathname } from 'next/navigation';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}));

describe('AppTabs Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });
  
  it('renders both tabs correctly', () => {
    // Mock the current path to be the home page
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<AppTabs />);
    
    // Check if both tabs are rendered
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    
    // The Chart tab should be active
    const chartTab = screen.getByText('Chart').closest('div');
    const statsTab = screen.getByText('Stats').closest('div');
    
    expect(chartTab).toHaveClass('text-white');
    expect(chartTab).toHaveClass('border-blue-500');
    expect(statsTab).toHaveClass('text-gray-400');
  });
  
  it('highlights Stats tab when on stats page', () => {
    // Mock the current path to be the stats page
    (usePathname as jest.Mock).mockReturnValue('/stats');
    
    render(<AppTabs />);
    
    // The Stats tab should be active
    const chartTab = screen.getByText('Chart').closest('div');
    const statsTab = screen.getByText('Stats').closest('div');
    
    expect(statsTab).toHaveClass('text-white');
    expect(statsTab).toHaveClass('border-blue-500');
    expect(chartTab).toHaveClass('text-gray-400');
  });
  
  it('navigates to home page when Chart tab is clicked', () => {
    // Mock the current path to be the stats page
    (usePathname as jest.Mock).mockReturnValue('/stats');
    
    render(<AppTabs />);
    
    // Click the Chart tab
    fireEvent.click(screen.getByText('Chart'));
    
    // Verify router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/');
  });
  
  it('navigates to stats page when Stats tab is clicked', () => {
    // Mock the current path to be the home page
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<AppTabs />);
    
    // Click the Stats tab
    fireEvent.click(screen.getByText('Stats'));
    
    // Verify router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/stats');
  });
}); 