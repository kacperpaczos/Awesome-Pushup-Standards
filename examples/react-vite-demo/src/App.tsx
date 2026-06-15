import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

export function App() {
  const { register, handleSubmit } = useForm<FormData>();

  return (
    <main>
      <h1>React Vite Demo</h1>
      <form onSubmit={handleSubmit((data) => schema.parse(data))}>
        <input type="email" {...register('email')} />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
