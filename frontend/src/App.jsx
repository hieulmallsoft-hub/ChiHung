import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { bootstrapAuth } = useAuth();

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  return <AppRoutes />;
}

export default App;
