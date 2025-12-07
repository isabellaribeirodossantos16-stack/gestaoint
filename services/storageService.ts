import { User, AppContent, UserRole, AdminPermissions, PersonalData } from '../types';
import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const CONTENT_COLLECTION = 'content';

// Permissões padrão
const FULL_PERMISSIONS: AdminPermissions = {
  createUsers: true,
  createContent: true,
  editData: true,
  deleteData: true,
  viewUsers: true,
  manageAdmins: true
};

// Inicializa usuários padrão se não existirem (Admin e Coutinho)
export const initStorage = async () => {
  try {
    const adminRef = doc(db, USERS_COLLECTION, 'admin-001');
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      const adminUser: User = {
        id: 'admin-001',
        username: 'admin',
        idType: 'matricula',
        password: 'admin',
        role: UserRole.ADMIN,
        isFirstAccess: false,
        permissions: FULL_PERMISSIONS
      };
      await setDoc(adminRef, adminUser);
      console.log('Admin padrão criado no Firebase');
    }

    const coutinhoRef = doc(db, USERS_COLLECTION, 'super-admin-coutinho');
    const coutinhoSnap = await getDoc(coutinhoRef);

    if (!coutinhoSnap.exists()) {
      const superUser: User = {
        id: 'super-admin-coutinho',
        username: 'Coutinho',
        idType: 'matricula',
        password: 'Coutinho@89',
        role: UserRole.ADMIN,
        isFirstAccess: false,
        permissions: FULL_PERMISSIONS
      };
      await setDoc(coutinhoRef, superUser);
      console.log('Super Admin Coutinho criado no Firebase');
    }
  } catch (error) {
    console.error("Erro ao inicializar storage:", error);
  }
};

// Busca todos os usuários
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};

// Salva ou atualiza um usuário
export const saveUser = async (user: User): Promise<void> => {
  try {
    // Remove campos undefined do objeto antes de salvar
    const userToSave = JSON.parse(JSON.stringify(user));
    await setDoc(doc(db, USERS_COLLECTION, user.id), userToSave);
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    throw error;
  }
};

// Deleta um usuário
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
  }
};

// Cria um novo usuário
export const createUser = async (
  username: string, 
  idType: 'cpf' | 'matricula', 
  role: UserRole = UserRole.USER, 
  password?: string, 
  permissions?: AdminPermissions, 
  secondaryId?: string
): Promise<boolean> => {
  try {
    // Verifica duplicidade
    const users = await getUsers();
    if (users.find(u => u.username === username)) {
      return false; // Usuário já existe
    }
    
    let initialPersonalData: PersonalData | undefined = undefined;
    if (secondaryId) {
      initialPersonalData = {
          fullName: '', rg: '', birthDate: '', phone: '', secondaryId: secondaryId,
          voterTitle: '', reservistId: '', pisPasep: '', cep: '', state: '', city: '',
          neighborhood: '', address: '', houseNumber: '', complement: '',
          bankData: { pixType: '', pixKey: '', holderName: '', bankName: '', agency: '', account: '' }
      };
    }

    // Criação do objeto base sem campos undefined
    const newUser: Record<string, any> = {
      id: crypto.randomUUID(),
      username,
      idType,
      password: password || '', 
      role,
      isFirstAccess: role === UserRole.USER,
    };

    // Adiciona permissões apenas se for ADMIN e existirem permissões
    if (role === UserRole.ADMIN && permissions) {
      newUser.permissions = permissions;
    }

    // Adiciona dados pessoais apenas se existirem
    if (initialPersonalData) {
      newUser.personalData = initialPersonalData;
    }

    await setDoc(doc(db, USERS_COLLECTION, newUser.id), newUser);
    return true;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return false;
  }
};

// Busca conteúdos
export const getContent = async (): Promise<AppContent[]> => {
  try {
    const q = query(collection(db, CONTENT_COLLECTION));
    const querySnapshot = await getDocs(q);
    const list: AppContent[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as AppContent);
    });
    // Ordenação manual por data (mais recente primeiro)
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Erro ao buscar conteúdo:", error);
    return [];
  }
};

// Adiciona conteúdo
export const addContent = async (content: AppContent): Promise<void> => {
  try {
    await setDoc(doc(db, CONTENT_COLLECTION, content.id), content);
  } catch (error) {
    console.error("Erro ao adicionar conteúdo:", error);
    throw new Error("Erro ao salvar. O arquivo pode ser muito grande (Limite ~900KB no Firestore).");
  }
};

// Deleta conteúdo
export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CONTENT_COLLECTION, contentId));
  } catch (error) {
    console.error("Erro ao deletar conteúdo:", error);
  }
};

// Helper para converter arquivo em Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validação simples de tamanho (aprox 900KB para segurança no Firestore)
    if (file.size > 900 * 1024) {
      reject(new Error("O arquivo é muito grande para o modo gratuito básico. Limite: 900KB."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};