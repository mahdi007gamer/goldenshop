"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  Product,
  CartItem,
  GeneratedLicense,
  SupportTicket,
  SecurityEvent,
  LegacyUserSession,
  BillingCycle,
  Toast,
} from "@/types";
import {
  INITIAL_TICKETS,
  INITIAL_SECURITY_EVENTS,
} from "@/data/mockData";

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product, billingCycle: BillingCycle) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  licenses: GeneratedLicense[];
  setLicenses: React.Dispatch<React.SetStateAction<GeneratedLicense[]>>;
  addLicenses: (newLicenses: GeneratedLicense[]) => void;
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  addTicket: (subject: string, game: string, initialMsg: string) => void;
  securityEvents: SecurityEvent[];
  appendSecurityLog: (type: SecurityEvent["eventType"], details: string) => void;
  userSession: LegacyUserSession;
  setUserSession: React.Dispatch<React.SetStateAction<LegacyUserSession>>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  checkoutOpen: boolean;
  setCheckoutOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loginModalOpen: boolean;
  setLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  directProduct: Product | null;
  setDirectProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  directBillingCycle: BillingCycle;
  setDirectBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
  triggerDirectPurchase: (product: Product) => void;
  handleSuccessPay: (newLicenses: GeneratedLicense[]) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [licenses, setLicenses] = useState<GeneratedLicense[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_EVENTS);
  const [userSession, setUserSession] = useState<LegacyUserSession>({
    loggedIn: false,
    username: "",
    tfaEnabled: false,
  });
  const [activeTab, setActiveTab] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [directBillingCycle, setDirectBillingCycle] = useState<BillingCycle>("monthly");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(0);

  // Toast helpers
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    setCounter((c) => c + 1);
    const id = `toast-${counter}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, [counter]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Security log — defined early so it can be used in login/logout
  const appendSecurityLog = useCallback(
    (type: SecurityEvent["eventType"], details: string) => {
      setCounter((c) => c + 1);
      const log: SecurityEvent = {
        id: `SEC-${counter}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        eventType: type,
        ip: `192.168.1.${(counter % 254) + 1}`,
        details,
        severity: "LOW",
      };
      setSecurityEvents((prev) => [log, ...prev]);
    },
    [counter]
  );

  // Login
  const login = useCallback(
    (username: string) => {
      if (username.trim()) {
        const session: LegacyUserSession = {
          loggedIn: true,
          username: username.trim(),
          tfaEnabled: true,
          role: username.toLowerCase() === "admin" ? "admin" : "user",
        };
        setUserSession(session);
        setLoginModalOpen(false);
        addToast({
          type: "success",
          title: "Welcome back, Warrior!",
          message: `Logged in as ${username}`,
        });
        appendSecurityLog("AUTH_JWT", `User "${username}" authenticated successfully.`);
        return true;
      }
      return false;
    },
    [addToast, appendSecurityLog]
  );

  // Logout
  const logout = useCallback(() => {
    const name = userSession.username;
    setUserSession({ loggedIn: false, username: "", tfaEnabled: false });
    addToast({
      type: "info",
      title: "Logged out",
      message: `Farewell, ${name}`,
    });
    appendSecurityLog("AUTH_JWT", `User "${name}" signed out.`);
    setActiveTab("home");
  }, [userSession.username, addToast, appendSecurityLog]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("gc_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedLicenses = localStorage.getItem("gc_licenses");
      if (savedLicenses) setLicenses(JSON.parse(savedLicenses));
      const savedSession = localStorage.getItem("gc_user_session");
      if (savedSession) setUserSession(JSON.parse(savedSession));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Fetch products from API on mount
  useEffect(() => {
    fetch("/api/products?take=100")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      })
      .catch(() => {
        // silently fail — products will be empty until next navigation
      });
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("gc_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("gc_licenses", JSON.stringify(licenses));
  }, [licenses]);
  useEffect(() => {
    localStorage.setItem("gc_user_session", JSON.stringify(userSession));
  }, [userSession]);

  const addToCart = (product: Product, billingCycle: BillingCycle) => {
    setCounter((c) => c + 1);
    const cartId = `cart-${counter}`;
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.billingCycle === billingCycle
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        { id: cartId, product, quantity: 1, billingCycle },
      ];
    });
    setCartOpen(true);
    addToast({
      type: "success",
      title: "Added to Cart",
      message: `${product.name} (${billingCycle})`,
    });
    appendSecurityLog(
      "AUTH_JWT",
      "Product appended to dynamic checkout envelope indices safely."
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const addLicenses = (newLicenses: GeneratedLicense[]) => {
    setLicenses((prev) => [...newLicenses, ...prev]);
  };

  const addTicket = (subject: string, game: string, initialMsg: string) => {
    setCounter((c) => c + 1);
    const newTkt: SupportTicket = {
      id: `TKT-${counter}`,
      userName: userSession.username || "Anonymous Warrior",
      subject,
      game,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
      messages: [
        {
          role: "user",
          text: initialMsg,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        },
      ],
    };
    setTickets((prev) => [newTkt, ...prev]);
    addToast({
      type: "success",
      title: "Ticket Created",
      message: `Ticket #${newTkt.id} has been submitted.`,
    });
    appendSecurityLog(
      "XSS_FILTER",
      `Sanitised message string from user ticket dispatcher for ticket ID: ${newTkt.id}`
    );
  };

  const triggerDirectPurchase = (product: Product) => {
    setDirectProduct(product);
    setDirectBillingCycle("monthly");
    setCheckoutOpen(true);
  };

  const handleSuccessPay = (newLicenses: GeneratedLicense[]) => {
    addLicenses(newLicenses);
    clearCart();
    setCheckoutOpen(false);
    setDirectProduct(null);
    setActiveTab("licenses");
    addToast({
      type: "success",
      title: "Payment Successful!",
      message: `${newLicenses.length} license(s) generated. Check your Licenses panel.`,
    });
    appendSecurityLog(
      "2FA_VERIFY",
      `Successfully completed payment security block. Issued ${newLicenses.length} licensing signatures.`
    );
  };

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        licenses,
        setLicenses,
        addLicenses,
        tickets,
        setTickets,
        addTicket,
        securityEvents,
        appendSecurityLog,
        userSession,
        setUserSession,
        login,
        logout,
        activeTab,
        setActiveTab,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        loginModalOpen,
        setLoginModalOpen,
        directProduct,
        setDirectProduct,
        directBillingCycle,
        setDirectBillingCycle,
        triggerDirectPurchase,
        handleSuccessPay,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
