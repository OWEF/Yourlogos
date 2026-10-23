// Values come from the public runtime config endpoint, not hard-coded credentials.
// Supabase publishable keys are safe for browsers; secret/service-role keys are not.
const response=await fetch("/api/public-config",{cache:"no-store"}).catch(()=>null);
const config=response?.ok?await response.json().catch(()=>({})):{};
export const AUTH_URL=typeof config.supabaseUrl==="string"?config.supabaseUrl:"";
export const AUTH_PUBLISHABLE_KEY=typeof config.supabasePublishableKey==="string"?config.supabasePublishableKey:"";
