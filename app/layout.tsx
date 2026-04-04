import "./styles/style.css";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body style={{
        margin: 0,
        padding: 0,
        width: "100%",
        overflowX: "hidden",
        background: "#0a0a0a"
      }}>

        <Navbar />

        <Toaster />

        <main style={{ width: "100%" }}>
          {children}
        </main>

      </body>
    </html>
  );
}