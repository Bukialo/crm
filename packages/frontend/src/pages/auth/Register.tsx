import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Plane } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    const success = await registerUser(
      data.email,
      data.password,
      data.firstName,
      data.lastName
    );
    setIsLoading(false);

    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <Card className="w-full max-w-md relative z-10" variant="gradient">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Únete a Bukialo
          </h1>
          <p className="text-white/60">Crea tu cuenta para comenzar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register("firstName")}
              label="Nombre"
              placeholder="Juan"
              leftIcon={<User className="w-5 h-5" />}
              error={errors.firstName?.message}
            />

            <Input
              {...register("lastName")}
              label="Apellido"
              placeholder="Pérez"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register("email")}
            type="email"
            label="Email"
            placeholder="tu@email.com"
            leftIcon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
          />

          <Input
            {...register("password")}
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            leftIcon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
          />

          <Input
            {...register("confirmPassword")}
            type="password"
            label="Confirmar Contraseña"
            placeholder="••••••••"
            leftIcon={<Lock className="w-5 h-5" />}
            error={errors.confirmPassword?.message}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
              required
            />
            <label className="ml-2 text-sm text-white/60">
              Acepto los{" "}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                política de privacidad
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Crear Cuenta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
