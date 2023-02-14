const siteURL = window.location.origin + "/subscribe-sys";
const redirect_uri = encodeURIComponent(siteURL + "/authenticate");
const scope = ["guilds.members.read", "identify"];
const scope_uri = encodeURIComponent(scope.join(" "));
const discordOauthURL = `https://discord.com/api/oauth2/authorize?client_id=719120395571298336&redirect_uri=${redirect_uri}&response_type=code&scope=${scope_uri}`;

export { discordOauthURL, siteURL };
