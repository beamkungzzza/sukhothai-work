import {redirect} from 'next/navigation';
import {taskIdentity} from '../task-access';
import Home from '../page';
export const dynamic='force-dynamic';
export default async function Manage(){if(!(await taskIdentity()).canEdit)redirect('/api/auth/signin?callbackUrl=%2Fmanage');return <Home/>}
