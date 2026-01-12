import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/app/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: "/", // Home page as login
  },

  callbacks: {
    /**
     * Runs on sign in
     * - Check if user exists
     * - If not, create user
     */
    async signIn({ user }) {
      const { name, email, image } = user;

      try {
        const existingUser = await pool.query(
          "SELECT id FROM users WHERE email = $1",
          [email]
        );

        if (existingUser.rows.length === 0) {
          await pool.query(
            `
            INSERT INTO users (name, email, image)
            VALUES ($1, $2, $3)
            `,
            [name, email, image]
          );
        }

        return true;
      } catch (error) {
        console.error("SignIn Error:", error);
        return false;
      }
    },

    /**
     * Attach DB user id to JWT
     */
    async jwt({ token, user }) {
      if (user?.email) {
        const result = await pool.query(
          "SELECT id FROM users WHERE email = $1",
          [user.email]
        );

        token.id = result.rows[0].id;
      }
      return token;
    },

    /**
     * Attach DB user id to session
     */
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
