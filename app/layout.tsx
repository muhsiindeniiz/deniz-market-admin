import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
export const metadata: Metadata = {
  title: 'Deniz Market Admin',
  description: 'Deniz Market Yönetim Paneli',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
