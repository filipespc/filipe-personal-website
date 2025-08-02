import { Route, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Portfolio from "./pages/Portfolio";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={Portfolio} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route component={NotFound} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;