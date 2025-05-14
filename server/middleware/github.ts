import { authenticateAndGetGitHubHeaders } from '../modules/authentication';

type Scope = 'org' | 'team' | 'ent';

export default defineEventHandler(async (event) => {
    // get runtime config
    const config = useRuntimeConfig(event);

    // get github headers - this also authenticates the user 
    // and throws exception when authentication is required but not provided
    event.context.headers = await authenticateAndGetGitHubHeaders(event);

    event.context.ent = config.public.githubEnt
    event.context.org = config.public.githubOrg
    
    // Handle multiple teams as an array
    const teamsString = config.public.githubTeam;
    event.context.teams = teamsString ? teamsString.split(',').map(team => team.trim()) : [];
    
    // Check if a specific team was requested in the query parameters
    const query = getQuery(event);
    const requestedTeam = query.team as string;
    
    // If a specific team was requested and it's in the teams list, use it
    if (requestedTeam && event.context.teams.includes(requestedTeam)) {
        event.context.team = requestedTeam;
    } else {
        // Otherwise use the first team in the list
        event.context.team = event.context.teams.length > 0 ? event.context.teams[0] : null;
    }

    if (event.context.team && event.context.org) {
        event.context.scope = 'team' as Scope;
    }
    else if (event.context.org) {
        event.context.scope = 'org' as Scope;
    }
    else if (event.context.ent) {
        event.context.scope = 'ent' as Scope;
    }
})