import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { useAuth } from '../providers/AuthProvider';

interface LoginForm {
  identifier: string;
  password: string;
}

export const LoginPage = () => {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    defaultValues: { identifier: '', password: '' }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | undefined)?.from?.pathname ?? '/';

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await signIn(values.identifier, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMessage((error as Error).message ?? 'Inloggen mislukt');
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Inloggen</h1>
        <p className="text-sm text-slate-600">Gebruik je gebruikersnaam of e-mail samen met je wachtwoord.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="identifier">Gebruikersnaam of e-mail</Label>
          <Input id="identifier" type="text" autoComplete="username" {...register('identifier', { required: true })} />
        </div>
        <div>
          <Label htmlFor="password">Wachtwoord</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register('password', { required: true })} />
        </div>
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</div>
        )}
        <Button type="submit" className="w-full" loading={formState.isSubmitting}>
          Inloggen
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Nog geen account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Registreer als commenter
        </Link>
      </p>
    </div>
  );
};
