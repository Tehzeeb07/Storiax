import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { registerSchema } from "../validation/authSchema";

function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          username: data.username,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <AuthLayout title="Create Your Account">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />

        <Input
          label="Username"
          placeholder="Choose a username"
          {...register("username")}
          error={errors.username?.message}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          {...register("password")}
          error={errors.password?.message}
        />

        <Button type="submit">
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;