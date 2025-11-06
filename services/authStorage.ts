// Almacenamiento temporal en memoria - no persiste entre sesiones
let temporaryToken: string | null = null;

export const getToken = async (): Promise<string | null> => {
  return temporaryToken;
};

export const setToken = async (token: string): Promise<void> => {
  temporaryToken = token;
};

export const removeToken = async (): Promise<void> => {
  temporaryToken = null;
};