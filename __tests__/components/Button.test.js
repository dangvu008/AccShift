import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button, PrimaryButton, SecondaryButton, IconButton } from '../../components';

describe('Button Component', () => {
  // === BASIC RENDERING TESTS ===
  
  it('renders correctly with default props', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders with custom title', () => {
    const { getByText } = render(<Button title="Custom Title" />);
    expect(getByText('Custom Title')).toBeTruthy();
  });

  // === VARIANT TESTS ===
  
  it('renders PrimaryButton correctly', () => {
    const { getByText } = render(<PrimaryButton title="Primary" />);
    expect(getByText('Primary')).toBeTruthy();
  });

  it('renders SecondaryButton correctly', () => {
    const { getByText } = render(<SecondaryButton title="Secondary" />);
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('renders IconButton correctly', () => {
    const { getByTestId } = render(
      <IconButton 
        iconName="SETTINGS" 
        testID="icon-button"
      />
    );
    expect(getByTestId('icon-button')).toBeTruthy();
  });

  // === SIZE TESTS ===
  
  it('renders with different sizes', () => {
    const sizes = ['tiny', 'small', 'medium', 'large', 'xlarge'];
    
    sizes.forEach(size => {
      const { getByText } = render(
        <Button title={`${size} Button`} size={size} />
      );
      expect(getByText(`${size} Button`)).toBeTruthy();
    });
  });

  // === INTERACTION TESTS ===
  
  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={mockOnPress} disabled />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('calls onLongPress when long pressed', () => {
    const mockOnLongPress = jest.fn();
    const { getByText } = render(
      <Button title="Long Press" onLongPress={mockOnLongPress} />
    );
    
    fireEvent(getByText('Long Press'), 'longPress');
    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  // === LOADING STATE TESTS ===
  
  it('shows loading state correctly', () => {
    const { getByTestId } = render(
      <Button title="Loading" loading testID="loading-button" />
    );
    
    // Should show loading indicator
    expect(getByTestId('loading-button')).toBeTruthy();
  });

  it('disables button when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Loading" onPress={mockOnPress} loading />
    );
    
    fireEvent.press(getByText('Loading'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  // === ACCESSIBILITY TESTS ===
  
  it('has correct accessibility properties', () => {
    const { getByRole } = render(
      <Button 
        title="Accessible Button" 
        accessibilityLabel="Custom accessibility label"
        accessibilityHint="Custom accessibility hint"
      />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('has disabled accessibility state when disabled', () => {
    const { getByRole } = render(
      <Button title="Disabled Button" disabled />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  // === ICON TESTS ===
  
  it('renders with left icon', () => {
    const { getByTestId } = render(
      <Button 
        title="With Icon" 
        iconName="SETTINGS" 
        iconPosition="left"
        testID="button-with-icon"
      />
    );
    
    expect(getByTestId('button-with-icon')).toBeTruthy();
  });

  it('renders with right icon', () => {
    const { getByTestId } = render(
      <Button 
        title="With Icon" 
        iconName="ARROW_RIGHT" 
        iconPosition="right"
        testID="button-with-right-icon"
      />
    );
    
    expect(getByTestId('button-with-right-icon')).toBeTruthy();
  });

  it('renders icon only button', () => {
    const { getByTestId } = render(
      <Button 
        iconName="SETTINGS" 
        iconPosition="only"
        testID="icon-only-button"
      />
    );
    
    expect(getByTestId('icon-only-button')).toBeTruthy();
  });

  // === FULL WIDTH TESTS ===
  
  it('renders full width button', () => {
    const { getByTestId } = render(
      <Button 
        title="Full Width" 
        fullWidth 
        testID="full-width-button"
      />
    );
    
    expect(getByTestId('full-width-button')).toBeTruthy();
  });

  // === VARIANT SPECIFIC TESTS ===
  
  it('renders all button variants correctly', () => {
    const variants = [
      'primary', 'secondary', 'outline', 'ghost', 
      'gradient', 'success', 'warning', 'error', 'info'
    ];
    
    variants.forEach(variant => {
      const { getByText } = render(
        <Button title={`${variant} Button`} variant={variant} />
      );
      expect(getByText(`${variant} Button`)).toBeTruthy();
    });
  });

  // === EDGE CASES ===
  
  it('handles empty title gracefully', () => {
    const { container } = render(<Button title="" />);
    expect(container).toBeTruthy();
  });

  it('handles undefined onPress gracefully', () => {
    const { getByText } = render(<Button title="No Handler" />);
    
    // Should not throw error when pressed
    expect(() => {
      fireEvent.press(getByText('No Handler'));
    }).not.toThrow();
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Button 
        title="Custom Style" 
        style={customStyle}
        testID="custom-style-button"
      />
    );
    
    expect(getByTestId('custom-style-button')).toBeTruthy();
  });
});

// === INTEGRATION TESTS ===

describe('Button Integration', () => {
  it('works with form submission', () => {
    const mockSubmit = jest.fn();
    
    const { getByText } = render(
      <Button title="Submit" onPress={mockSubmit} variant="primary" />
    );
    
    fireEvent.press(getByText('Submit'));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('works with navigation', () => {
    const mockNavigate = jest.fn();
    
    const { getByText } = render(
      <Button title="Navigate" onPress={mockNavigate} iconName="ARROW_RIGHT" />
    );
    
    fireEvent.press(getByText('Navigate'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

// === PERFORMANCE TESTS ===

describe('Button Performance', () => {
  it('renders quickly with many buttons', () => {
    const startTime = Date.now();
    
    const buttons = Array.from({ length: 100 }, (_, i) => (
      <Button key={i} title={`Button ${i}`} />
    ));
    
    render(<>{buttons}</>);
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // Should render 100 buttons in less than 1 second
    expect(renderTime).toBeLessThan(1000);
  });
});
