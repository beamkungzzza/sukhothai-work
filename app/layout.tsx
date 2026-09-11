import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'ตารางงานคณะสุโขทัย', description: 'ดูตารางงาน ผู้รับผิดชอบ กำหนดส่ง และรายละเอียดของทีม SUK' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="th"><body>{children}</body></html>; }
