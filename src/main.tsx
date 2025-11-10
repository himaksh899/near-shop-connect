import { createRoot } from "react-dom/client";
import { CartProvider } from "./contexts/CartContext.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <CartProvider>
    <App />
  </CartProvider>
);
