import { Link } from "react-router-dom";
import { api } from "../api";
import { useData } from "../data";
import { useRecipes } from "../components/CloneSetup";
import type { SetupRecipes } from "../api";
import { Box } from "../components/Layout";
import { Hero } from "../components/Hero";
import { CodeSample } from "../components/CopyButton";

export function Owners() {
  const recipes = useRecipes();
  const owners = useData("owners", api.owners);
  if (owners.length === 0) {
    return <BlankSlate recipes={recipes} />;
  }
  return (
    <>
      <Hero />
      <AuthenticationInstructions recipes={recipes} />
      <NewRepoInstructions baseUrl={recipes.base_url} />
      <h2 className="page-title">Repositories by owner</h2>
      <Box>
        <ul className="list">
          {owners.map((o) => (
            <li key={o}>
              <Link to={`/${o}`} className="strong">
                {o}
              </Link>
            </li>
          ))}
        </ul>
      </Box>
    </>
  );
}

function AuthenticationInstructions({ recipes }: { recipes: SetupRecipes }) {
  return (
    <Box title="Authenticate Git on this machine">
      <div className="pad">
        <p className="small muted">
          Run the installer once to set up your Git credential helper. It asks for an access token when needed
          {recipes.token_url && (
            <>
              {" "}
              — <a href={recipes.token_url}>sign in and create one</a> first
            </>
          )}
          . Then Git can authenticate your clones, fetches and pushes.
        </p>
        <CodeSample code={recipes.install} />
      </div>
    </Box>
  );
}

function NewRepoInstructions({ baseUrl }: { baseUrl: string }) {
  return (
    <Box title="Add a repository on push">
      <div className="pad">
        <p className="small muted">
          From your local Git repository, choose an owner and name, add the remote, then push.
          The first push creates the repository when this server has <code>server.auto_create_on_push</code> enabled.
        </p>
        <CodeSample code={`git remote add origin ${baseUrl}/area/repository.git\ngit push -u origin HEAD`} />
        <p className="small muted">
          Replace <code>area/repository</code> with your owner/repository. If <code>origin</code> already exists,
          use <code>git remote set-url origin {baseUrl}/area/repository.git</code> instead of adding it.
        </p>
      </div>
    </Box>
  );
}

function BlankSlate({ recipes }: { recipes: SetupRecipes }) {
  return (
    <div className="blankslate">
      <h1>Nothing here yet</h1>
      <p>Set up Git authentication, then add a remote and push your local repository.</p>
      <AuthenticationInstructions recipes={recipes} />
      <NewRepoInstructions baseUrl={recipes.base_url} />
    </div>
  );
}
