import LoginForm from "./login-form";
import AuthLayout from "./auth-layout";

const LoginPage = () => {
  return (
    <AuthLayout title="Sign in to your account" subTitle="Please enter your credentials to sign in!">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
