import React from 'react';
import { OwnerAuthModal } from '../../KOSDESYN/05-babushka-backoffice/OwnerAuthModal';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  [key: string]: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, ...rest }) => {
  return <OwnerAuthModal isOpen={isOpen} onClose={onClose} {...rest} />;
};

export default AuthModal;
