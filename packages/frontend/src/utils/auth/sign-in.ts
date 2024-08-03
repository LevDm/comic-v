import type { Account, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';

interface SignInCallback {
  user: User | AdapterUser;
  account: Account | null;
}

export async function signIn(params: SignInCallback): Promise<boolean> {
  const { account } = params;

  if (account?.provider == 'credentials') {
    //console.log('signIn custom');
    return true;
  }

  return false;
}
