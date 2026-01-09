import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const getSystemConfig = async () => {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'system'));
    if (configDoc.exists()) {
      return configDoc.data();
    } else {
      // Criar configuração padrão se não existir
      const defaultConfig = { limiteParticipantes: 50 };
      await setDoc(doc(db, 'config', 'system'), defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return { limiteParticipantes: 50 };
  }
};

export const updateSystemConfig = async (config) => {
  try {
    await setDoc(doc(db, 'config', 'system'), config);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return false;
  }
};