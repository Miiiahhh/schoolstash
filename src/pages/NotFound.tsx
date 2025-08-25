import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-elegant border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Package className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground">404</CardTitle>
          <CardDescription className="text-lg">
            Oops! Página não encontrada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Button 
            asChild
            className="bg-gradient-primary hover:shadow-glow transition-smooth"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
