import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { DatabaseService } from './database';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    userId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
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
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      
      // Store user ID in token
      if (user) {
        token.userId = user.id;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string;
      
      // Store user in database and save access token
      if (session.user?.email && token.accessToken) {
        try {
          // Check if user exists, if not create them
          let user = await DatabaseService.getUserByEmail(session.user.email);
          
          if (!user) {
            // Create new user
            const newUser = await DatabaseService.createUser({
              email: session.user.email,
              name: session.user.name || '',
              image: session.user.image || '',
              github_id: session.user.id || ''
            });
            user = newUser;
          }
          
          // Store the access token
          if (user) {
            await DatabaseService.storeUserToken(user.id, token.accessToken as string);
            session.user.id = user.id;
          }
        } catch (error) {
          console.error('Error storing user data:', error);
          // If database operations fail, still try to get user ID from token
          if (token.userId) {
            session.user.id = token.userId as string;
          }
        }
      } else if (token.userId) {
        // Fallback: use user ID from token
        session.user.id = token.userId as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful authentication
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt'
  }
}; 