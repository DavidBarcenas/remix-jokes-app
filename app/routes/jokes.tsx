import { Form, LinksFunction, LoaderFunction } from 'remix';
import type { Joke, User } from '@prisma/client';
import { useLoaderData } from 'remix';
import { Link } from 'remix';
import { Outlet } from 'remix';
import { z } from 'zod';
import { db } from '~/utils/db.server';
import stylesUrl from '~/styles/jokes.css';
import { getUser } from '~/utils/session.server';

type LoaderData = {
  user: User | null;
  jokeListItems: Array<Pick<Joke, 'id' | 'name'>>;
};

const LoaderDataSchema = z.object({
  jokeListItems: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  user: z.nullable(
    z.object({
      id: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      username: z.string(),
      passwordHash: z.string(),
    }),
  ),
});

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  });
  const user = await getUser(request);
  const data: LoaderData = {
    jokeListItems,
    user,
  };

  return data;
};

export default function Jokes() {
  const data = LoaderDataSchema.parse(useLoaderData<LoaderData>());

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link prefetch="intent" to=".">
              Get a random joke
            </Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(j => (
                <li key={j.id}>
                  <Link prefetch="intent" to={j.id}>
                    {j.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
