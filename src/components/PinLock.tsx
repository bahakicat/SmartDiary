import React, { useState, useEffect } from 'react';
import { Lock, Delete, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';

interface PinLockProps {
  correctPin: string;
  onUnlock?: () => void;
  isSettingUp?: boolean;
  onSetPin?: (pin: string) => void;
  onCancel?: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ correctPin, onUnlock, isSettingUp = false, onSetPin, onCancel }) => {
  const { t } = useLanguage();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN (for setup)
  const [tempPin, setTempPin] = useState("");

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (isSettingUp) {
        if (step === 1) {
          setTempPin(pin);
          setPin("");
          setStep(2);
        } else {
          if (pin === tempPin) {
            onSetPin?.(pin);
          } else {
            setError(true);
            setPin("");
            setStep(1);
            setTempPin("");
          }
        }
      } else {
        if (pin === correctPin) {
          onUnlock?.();
        } else {
          setError(true);
          setTimeout(() => setPin(""), 500);
        }
      }
    }
  }, [pin, correctPin, onUnlock, isSettingUp, step, tempPin, onSetPin]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-fade-in">
      {onCancel && (
        <button onClick={onCancel} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      )}
      
      <div className="mb-12 text-center">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all ${error ? "bg-red-100 text-red-600 animate-shake" : "bg-indigo-100 text-indigo-600"}`}>
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {isSettingUp 
            ? (step === 1 ? t("pin.set_title") : t("pin.confirm_title")) 
            : t("pin.unlock_title")}
        </h2>
        <p className="text-slate-500 font-medium">{t("pin.protected_desc")}</p>
      </div>

      <div className="flex gap-4 mb-16">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i ? "bg-indigo-500 border-indigo-500 scale-125" : "border-slate-300 dark:border-slate-700"}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
          <button 
            key={num}
            onClick={() => handleNumberClick(num)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-slate-800 text-2xl font-bold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <div />
        <button 
          onClick={() => handleNumberClick("0")}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-slate-800 text-2xl font-bold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center"
        >
          0
        </button>
        <button 
          onClick={handleDelete}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full text-slate-400 hover:text-slate-600 active:scale-90 transition-all flex items-center justify-center"
        >
          <Delete className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default PinLock;
