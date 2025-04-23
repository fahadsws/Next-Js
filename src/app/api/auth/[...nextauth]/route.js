// import NextAuth from "next-auth";
// import LinkedInProvider from "next-auth/providers/linkedin";

// export const authOptions = {
//   providers: [
//     LinkedInProvider({
//       clientId: process.env.LINKEDIN_CLIENT_ID || "",
//       clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
//       client: { token_endpoint_auth_method: "client_secret_post" },
//       issuer: "https://www.linkedin.com",
//       profile: (profile) => ({
//         id: profile.sub,
//         name: profile.name,
//         email: profile.email,
//         image: profile.picture,
//       }),
//       wellKnown:
//         "https://www.linkedin.com/oauth/.well-known/openid-configuration",
//       authorization: {
//         params: {
//           scope: "openid profile email",
//         },
//       },
//     }),
//   ],

//   debug: true,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

// Working 
// import NextAuth from "next-auth";
// import LinkedInProvider from "next-auth/providers/linkedin";
// export const authOptions = {
//   providers: [
//     LinkedInProvider({
//       clientId: process.env.LINKEDIN_CLIENT_ID || "",
//       clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
//       client: { token_endpoint_auth_method: "client_secret_post" },
//       issuer: "https://www.linkedin.com",
//       wellKnown:
//         "https://www.linkedin.com/oauth/.well-known/openid-configuration",
//       authorization: {
//         params: {
//           scope: "openid profile email",
//         },
//       },
//       profile: (profile) => ({
//         id: profile.sub, // LinkedIn unique ID
//         name: profile.name,
//         email: profile.email,
//         image: profile.picture,
//         uniid: profile.sub,
//       }),
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       if (profile) {
//         token.uniid = profile.sub;
//       }
//       if (account?.access_token) {
//         token.accessToken = account.access_token;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       session.uniid = token.uniid; 
//       session.accessToken = token.accessToken;
//       return session;
//     },
//   },
//   debug: true,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";

export const authOptions = {
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      client: { token_endpoint_auth_method: "client_secret_post" },
      issuer: "https://www.linkedin.com",
      wellKnown:
        "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
      profile: (profile) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        uniid: profile.sub,
      }),
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (profile) {
        try {
          const res = await fetch(`${process.env.BASE_API_URL}login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uniid: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              accessToken: account.access_token,
            }),
          });

          const result = await res.json();
          const data = result.data;
          if (data.status) {
            token.uniid = data.uniid;
            token.userId = data.id;
            token.name = data.name;
            token.email = data.email;
            toast.success(`Login Successfully`);
          }
        } catch (error) {
          console.error("❌ Failed to call backend:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.id = token.userId;
      session.uniid = token.uniid;
      session.accessToken = token.accessToken;
      session.name = token.name ?? session.user?.name;
      session.email = token.email ?? session.user?.email;
      return session;
    },
  },

  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

