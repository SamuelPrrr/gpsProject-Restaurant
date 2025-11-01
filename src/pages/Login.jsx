import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, ChefHat, Loader2, UtensilsCrossed, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Success",
          description: "Welcome back! You have been logged in successfully.",
        });
        // Redirect to admin dashboard after successful login
        navigate('/admin');
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      {/* Decorative elements */}

      
      {/* Main Login Card */}
      <Card className='w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/90 relative z-10 overflow-hidden'>
        {/* Decorative top bar */}
        <div className='h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600'></div>
        
        <CardContent className='p-8 sm:p-10'>
          {/* Logo Section */}
          <div className='text-center space-y-4 mb-8'>
            <div className='mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300'>
              <ChefHat className='w-9 h-9 text-white' strokeWidth={2.5} />
            </div>
            <div className='space-y-1'>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                Comandas Fuck Yeah
              </h1>
              <p className='text-gray-600 text-xs flex items-center justify-center gap-1'>
                <UtensilsCrossed className='w-3.5 h-3.5' />
                Sistema de comandas profesional
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className='space-y-6'>
            <div className='text-center space-y-1 mb-6'>
              <h2 className='text-xl font-bold text-gray-800'>Bienvenido de nuevo</h2>
              <p className='text-sm text-gray-600'>
                Ingresa tus credenciales para continuar
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className='space-y-5 max-w-sm mx-auto'
            >
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-gray-700 font-medium text-sm'>Usuario</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='tu@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='h-11 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white rounded-lg transition-all'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password' className='text-gray-700 font-medium text-sm'>Contraseña</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='h-11 pr-12 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white rounded-lg transition-all'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors'
                  >
                    {showPassword ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* <div className='flex items-center justify-between'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    className='w-4 h-4 text-black bg-background border-border rounded focus:ring-black focus:ring-2'
                  />
                  <span className='text-sm text-muted-foreground'>
                    Remember me
                  </span>
                </label>
                <button
                  type='button'
                  className='text-sm text-black hover:text-gray-700 transition-colors'
                >
                  Forgot password?
                </button>
              </div> */}

              <Button
                type='submit'
                className='w-full h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 rounded-lg'
                size='lg'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Iniciando sesión...
                  </>
                ) : (
                  <span className='flex items-center gap-2'>
                    <ChefHat className='w-4 h-4' />
                    Iniciar Sesión
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-200'></div>
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-white px-2 text-gray-500'>¿Necesitas ayuda?</span>
              </div>
            </div>

            <div className='text-center'>
              <p className='text-xs text-gray-600'>
                ¿No tienes una cuenta?{" "}
                <button className='text-orange-600 hover:text-orange-700 font-semibold transition-colors underline-offset-2 hover:underline'>
                  Contacta al administrador
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500'>
            <p>© 2025 RestaurantPOS. Todos los derechos reservados.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation buttons */}
      <div className='fixed bottom-6 right-6 flex gap-3'>
        <Button
          onClick={() => navigate('/cocina')}
          className='bg-orange-600 hover:bg-orange-700 text-white shadow-lg px-4 py-2 rounded-lg flex items-center gap-2'
        >
          <ChefHat className='w-4 h-4' />
          Cocina
        </Button>
        <Button
          onClick={() => navigate('/meseros')}
          className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-2 rounded-lg flex items-center gap-2'
        >
          <Users className='w-4 h-4' />
          Meseros
        </Button>
      </div>
    </div>
  );
};

export default Login;
