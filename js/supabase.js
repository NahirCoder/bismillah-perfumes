/* =========================================================
   SUPABASE FRONTEND CLIENT
   ========================================================= */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
    window.SUPABASE_URL ||
    "https://mudgdnacywjfxvfvwkrt.supabase.co";

const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    "sb_publishable_cVD4tKUpZ5pHWxwWCmIumA_YfW6lCUY";


export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


export default supabase;