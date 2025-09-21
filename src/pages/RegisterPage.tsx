import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { useAuth } from '../providers/AuthProvider';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export const RegisterPage = () => {
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    defaultValues: { username: '', email: '', password: '' }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await signUp(values);
      navigate('/');
    } catch (error) {
      console.error(error);
      setErrorMessage((error as Error).message ?? 'Registratie mislukt');
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Account aanmaken</h1>
        <p className="text-sm text-slate-600">Meld je aan om foto's te bekijken en reacties te plaatsen.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Gebruikersnaam</Label>
          <Input id="username" type="text" autoComplete="username" {...register('username', { required: true })} />
        </div>
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email', { required: true })} />
        </div>
        <div>
          <Label htmlFor="password">Wachtwoord</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password', { required: true })} />
        </div>
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</div>
        )}
        <Button type="submit" className="w-full" loading={formState.isSubmitting}>
          Registreren
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Al een account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Log in
        </Link>
      </p>
    </div>
  );
};
