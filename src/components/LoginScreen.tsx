import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('agente@caxinguele.org');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError('Por favor, informe o e-mail e a senha do agente.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Insira um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0],
        role: 'Agente / Voluntário de Campo',
      });
    }, 300);
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-[440px] bg-white rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.87)] shadow-[0_4px_14px_rgba(0,0,0,0.06)] p-8 sm:p-10">
        
        {/* Title and subtitle */}
        <h1 className="text-[28px] font-bold text-[rgba(0,0,0,0.87)] tracking-tight leading-tight mb-2">
          Acesso Restrito
        </h1>
        <p className="text-[14px] text-[rgba(0,0,0,0.54)] mb-7 leading-relaxed">
          Painel de Registro de Ocorrências da ONG Caxinguêle.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-[4px] bg-[#F8D7DA] text-[#842029] border-[1.5px] border-[#F5C2C7] text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* E-mail input */}
          <div>
            <label
              htmlFor="email"
              className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-2 uppercase tracking-[0.03em]"
            >
              E-mail do Agente / Voluntário
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agente@caxinguele.org"
                className="w-full px-3.5 py-3 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-[15px] text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all font-mono"
              />
            </div>
          </div>

          {/* Senha input */}
          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-2 uppercase tracking-[0.03em]"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-3 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-[15px] text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F2C4D] hover:bg-[#0c2440] text-white text-[14px] font-bold uppercase tracking-[0.05em] py-3.5 px-6 rounded-[4px] cursor-pointer transition-all hover:opacity-95 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>ACESSAR SISTEMA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick test credentials / helpers */}
        <div className="mt-8 pt-5 border-t border-[rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.54)] font-medium mb-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0F2C4D]" />
            <span>Ambiente homologado para agentes ambientais de Mairiporã</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo('agente@caxinguele.org')}
              className="text-xs bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[rgba(0,0,0,0.8)] px-2.5 py-1 rounded-[3px] border border-[rgba(0,0,0,0.15)] cursor-pointer transition-colors"
            >
              Preencher: <strong>agente@caxinguele.org</strong>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('voluntario.resgate@caxinguele.org')}
              className="text-xs bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[rgba(0,0,0,0.8)] px-2.5 py-1 rounded-[3px] border border-[rgba(0,0,0,0.15)] cursor-pointer transition-colors"
            >
              Preencher: <strong>voluntário campo</strong>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
