import React from 'react';
import { Search } from 'lucide-react';
import './Input.css';

const Input = ({ label, icon: Icon, error, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <div className="input-icon"><Icon size={18} /></div>}
        <input 
          className={`input-field ${Icon ? 'with-icon' : ''} ${error ? 'has-error' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export const SearchInput = (props) => (
  <Input icon={Search} placeholder="Search anything…" {...props} />
);

export default Input;
