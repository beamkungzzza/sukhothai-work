import {getServerSession} from 'next-auth';
import {authOptions,editorAllowed} from './auth-options';
export async function taskIdentity(){const session=await getServerSession(authOptions);const email=session?.user?.email||null;return {email,canEdit:!!email&&editorAllowed(email)}}
