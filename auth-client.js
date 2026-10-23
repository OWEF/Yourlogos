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
 if(error||!data?.user)return null;
 return {id:data.user.id,email:data.user.email,displayName:data.user.user_metadata?.display_name||""};
}
export async function signOutEmail(){
 if(!AUTH_ENABLED)return;
 const c=await client();const {error}=await c.auth.signOut();
 if(error)throw error;
}
