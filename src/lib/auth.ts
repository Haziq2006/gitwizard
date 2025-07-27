import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { DatabaseService } from './database';

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
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string;
      
      // Store user in database and save access token
      if (session.user?.email && token.accessToken) {
        try {
          // Check if user exists, if not create them
          const existingUser = await DatabaseService.getUserByEmail(session.user.email);
          
          if (!existingUser) {
            // Create new user
            await DatabaseService.createUser({
              email: session.user.email,
              name: session.user.name || '',
              image: session.user.image || '',
              github_id: session.user.id || ''
            });
          }
          
          // Store the access token
          const user = await DatabaseService.getUserByEmail(session.user.email);
          if (user) {
            await DatabaseService.storeUserToken(user.id, token.accessToken as string);
            session.user.id = user.id;
          }
        } catch (error) {
          console.error('Error storing user data:', error);
        }
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}; 