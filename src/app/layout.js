import "./globals.css";

export const metadata = {
  title: "TreinoCerto",
  description: "Seu treino de academia guiado, com evolução e coach de IA.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "TreinoCerto" },
};

export const viewport = {
  themeColor: "#13161B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            // Guarda o beforeinstallprompt cedo (antes do React montar) para o botão "Instalar app".
            __html: `window.__promptInstalar=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__promptInstalar=e;window.dispatchEvent(new Event('prompt-instalar-pronto'))});if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
