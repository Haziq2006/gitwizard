import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { DatabaseService } from './database';
import type { GithubProfile } from 'next-auth/providers/github';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      github_id?: string | null;
    };
    accessToken?: string;
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    github_id?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        try {
          // Create or update user in database
          await DatabaseService.upsertUser({
            email: user.email || '',
            name: user.name || '',
            image: user.image || undefined,
            github_id: (profile as GithubProfile).id?.toString()
          });
          // Fetch the user to get the UUID and attach to the user object for jwt callback
          const dbUser = await DatabaseService.getUserByEmail(user.email || '');
          if (dbUser && dbUser.id) {
            user.id = dbUser.id;
          }
          return true;
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Always set session.user.id to the internal user UUID from the database
      if (typeof token.internalUserId === 'string') {
        session.user.id = token.internalUserId;
      } else if (token.sub) {
        session.user.id = token.sub;
      }
      if (typeof token.github_id === 'string') {
        session.user.github_id = token.github_id;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, account, profile, user }) {
      // On sign in, set the internal user UUID from the user object if available
      if (user?.id) {
        token.internalUserId = user.id;
      } else if (account?.provider === 'github' && user?.email) {
        try {
          const { getUserByEmail } = await import('./database');
          const dbUser = await getUserByEmail(user.email);
          if (dbUser && dbUser.id) {
            token.internalUserId = dbUser.id;
          }
        } catch (e) {
          // fallback: do not set internalUserId
        }
      }
      if (account?.provider === 'github') {
        token.accessToken = account.access_token;
      }
      if (account?.provider === 'github' && profile) {
        const githubId = (profile as GithubProfile).id;
        token.github_id = githubId ? githubId.toString() : undefined;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
}; 