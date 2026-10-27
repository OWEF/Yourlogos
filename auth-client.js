import {AUTH_URL, AUTH_PUBLISHABLE_KEY} from "./auth-config.js";
export const AUTH_ENABLED=Boolean(/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/.test(AUTH_URL)&&/^(sb_publishable_|eyJ)/.test(AUTH_PUBLISHABLE_KEY));
let authClient=null;
async function client(){
 if(!AUTH_ENABLED)throw new Error("Email enrollment is not yet enabled. A dedicated YourLogos Auth project is needed.");
 if(!authClient){
  const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2.57.0");
  authClient=createClient(AUTH_URL,AUTH_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:"implicit"}});
 }
 return authClient;
}
export async function requestMagicLink(email,displayName){
 const c=await client();
 const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+"/",shouldCreateUser:true,data:{display_name:displayName}}});
 if(error)throw error;
}
export async function getVerifiedIdentity(){
 if(!AUTH_ENABLED)return null;
 const c=await client();const {data,error}=await c.auth.getUser();
 if(error||!data?.user||data.user.is_anonymous)return null;
 return {id:data.user.id,email:data.user.email,displayName:data.user.user_metadata?.display_name||""};
}
export async function getDiscoverAccessToken(){
 if(!AUTH_ENABLED)return null;
 const c=await client();
 const {data,error}=await c.auth.getSession();
 if(error)throw error;
 // Email login is optional for Discover. The backend independently issues a
 // short-lived same-origin guest session when no account token is present.
 return data?.session?.access_token||null;
}
export async function signOutEmail(){
 if(!AUTH_ENABLED)return;
 const c=await client();const {error}=await c.auth.signOut();
 if(error)throw error;
}

export async function fetchPublishedQuotes(){
 if(!AUTH_ENABLED)return [];
 const c=await client();
 const {data,error}=await c.from("quotes")
  .select("legacy_id,quote_text,author,theme,source,reflection_prompt")
  .eq("is_published",true).order("legacy_id",{ascending:true}).limit(500);
 if(error)throw error;
 return Array.isArray(data)?data:[];
}

/**
 * Owner-scoped cloud snapshot. No automatic migration or merge.
 * RLS on public.user_state enforces user_id = auth.uid().
 */
export async function readAccountData(){
  const c=await client();const identity=await getVerifiedIdentity();
  if(!identity)throw new Error("Verify your email account before restoring data.");
  const [profile,state]=await Promise.all([
    c.from("profiles").select("display_name").eq("user_id",identity.id).maybeSingle(),
    c.from("user_state").select("state,updated_at").eq("user_id",identity.id).maybeSingle()
  ]);
  if(profile.error)throw profile.error;
  if(state.error)throw state.error;
  return {name:profile.data?.display_name||identity.displayName||"",state:state.data?.state||null,updatedAt:state.data?.updated_at||null};
}
export async function writeAccountData(snapshot){
  const c=await client();const identity=await getVerifiedIdentity();
  if(!identity)throw new Error("Verify your email account before saving data.");
  if(!snapshot || typeof snapshot!=="object" || Array.isArray(snapshot))throw new Error("Invalid account data");
  const safe={};
  for(const k of ["saved","practice","discovery","themes","arrivals","started","cosmosEvents","personalization","livingThreads","encounterEvents","thoughtThreadEvents","encounters","aiDiscoverThreads","discoverJourneyEvents"]){
    if(Object.prototype.hasOwnProperty.call(snapshot,k))safe[k]=snapshot[k];
  }
  const serialized=JSON.stringify(safe);
  if(serialized.length>800000)throw new Error("Your history is too large for one snapshot. Please export it first.");
  const {error}=await c.from("user_state").upsert({user_id:identity.id,state:safe,updated_at:new Date().toISOString()},{onConflict:"user_id"});
  if(error)throw error;
  return true;
}
export async function writeAccountName(name){
  const c=await client();const identity=await getVerifiedIdentity();
  if(!identity)throw new Error("Verify your email account before saving a cloud display name.");
  const safe=String(name||"").trim().replace(/\s+/g," ").slice(0,32);
  if(!safe)throw new Error("A display name is required.");
  const {error}=await c.from("profiles").upsert({user_id:identity.id,display_name:safe,updated_at:new Date().toISOString()},{onConflict:"user_id"});
  if(error)throw error;
  return safe;
}
