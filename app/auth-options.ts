import type {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
export function editorAllowed(email:string){return (process.env.EDITOR_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
export const authOptions:NextAuthOptions={
 secret:process.env.NEXTAUTH_SECRET,
 session:{strategy:'jwt',maxAge:8*60*60},
 providers:[GoogleProvider({clientId:process.env.GOOGLE_CLIENT_ID||'',clientSecret:process.env.GOOGLE_CLIENT_SECRET||''})],
 callbacks:{async signIn({account,profile}){return account?.provider==='google'&&(profile as {email_verified?:boolean})?.email_verified===true&&!!profile?.email&&editorAllowed(profile.email);}}
};
