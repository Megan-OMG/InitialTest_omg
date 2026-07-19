import React from 'react';

export const MIN_PASSWORD_LENGTH = 8;

export const validatePasswords = (password, confirm) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password !== confirm) {
    return 'Passwords do not match';
  }
  return '';
};

const PasswordFields = ({ password, confirm, onPasswordChange, onConfirmChange }) => (
  <>
    <div className="form-group">
      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
    </div>
    <div className="form-group">
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        value={confirm}
        onChange={(e) => onConfirmChange(e.target.value)}
        placeholder="Re-enter password"
        autoComplete="new-password"
      />
    </div>
  </>
);

export default PasswordFields;
