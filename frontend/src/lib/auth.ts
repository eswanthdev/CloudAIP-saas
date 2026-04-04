import { CognitoUser, CognitoUserPool, AuthenticationDetails } from 'amazon-cognito-identity-js';

const COGNITO_REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-south-1';
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';
const COGNITO_USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';

const poolData = {
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
};

let userPool: CognitoUserPool | null = null;

if (typeof window !== 'undefined' && COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID) {
  userPool = new CognitoUserPool(poolData);
}

export interface AuthUser {
  email: string;
  name: string;
  sub: string;
  role?: string;
}

export const authHelper = {
  getCurrentUser: (): CognitoUser | null => {
    if (!userPool) return null;
    return userPool.getCurrentUser();
  },

  signUp: async (
    email: string,
    password: string,
    name: string
  ): Promise<{ userSub: string }> => {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('User pool not initialized'));
        return;
      }

      userPool.signUp(
        email,
        password,
        [{ Name: 'email', Value: email }],
        [],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ userSub: result?.userSub || '' });
          }
        }
      );
    });
  },

  confirmSignUp: async (email: string, confirmationCode: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('User pool not initialized'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(confirmationCode, true, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  signIn: async (email: string, password: string): Promise<AuthUser | null> => {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('User pool not initialized'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.getIdToken().getJwtToken();

          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('idToken', idToken);
          }

          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              reject(err);
            } else {
              const user: AuthUser = {
                email: email,
                name: attributes?.find((a) => a.Name === 'name')?.Value || email,
                sub: attributes?.find((a) => a.Name === 'sub')?.Value || '',
              };
              resolve(user);
            }
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {
          reject(new Error('Password reset required'));
        },
      });
    });
  },

  signOut: async (): Promise<void> => {
    if (!userPool) return;

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('User pool not initialized'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  },

  confirmNewPassword: async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('User pool not initialized'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  },

  getIdToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('idToken');
    }
    return null;
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  },
};

export default authHelper;
