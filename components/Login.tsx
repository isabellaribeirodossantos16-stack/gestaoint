import React, { useState, useEffect } from 'react';
import { getUsers, saveUser, initStorage } from '../services/storageService';
import { User } from '../types';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Inicializa o DB e verifica conexao
    const init = async () => {
        await initStorage();
        setIsInitializing(false);
    };
    init();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
        setError("Preencha todos os campos.");
        return;
    }
    setError('');
    setIsLoading(true);
    
    try {
        const users = await getUsers();
        const foundUser = users.find(u => u.username === username);

        if (foundUser) {
            if (foundUser.isFirstAccess) {
                if (password.length < 4) {
                    setError("Para criar sua senha, use no mínimo 4 caracteres.");
                    setIsLoading(false);
                    return;
                }
                
                // Atualiza senha e salva no Firebase
                foundUser.password = password;
                await saveUser(foundUser);
                
                onLogin(foundUser);
            } else {
                if (foundUser.password === password) {
                    onLogin(foundUser);
                } else {
                    setError("Senha incorreta.");
                }
            }
        } else {
            setError("Usuário não encontrado.");
        }
    } catch (err) {
        console.error(err);
        setError("Erro de conexão com o servidor.");
    } finally {
        setIsLoading(false);
    }
  };

  if (isInitializing) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2 text-blue-600"/>
                  <p>Conectando ao sistema...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Portal Corporativo</h1>
            <p className="text-gray-400 mt-2">Acesse seus documentos</p>
        </div>

        <div className="space-y-6">
            <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="CPF / Matrícula" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                    type="password" 
                    placeholder="Senha (Primeiro Acesso, Crie uma Senha)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-2 ml-1">
                    A senha é necessária para um login futuro
                </p>
            </div>
            
            {error && <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded-lg">{error}</p>}

            <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Entrar"}
            </button>
        </div>

        <div className="mt-8 text-center text-gray-400 text-xs">
            &copy; 2026 S.F.D. Powered by Maicon Coutinho.
        </div>
      </div>
    </div>
  );
};

export default Login;