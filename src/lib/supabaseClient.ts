import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL o Anon Key no configuradas. Revisa tu archivo .env.local');
}

type QueryResult = { data: unknown[] | null; error: { message: string; code: string } | null };

function createNoopResult(result: QueryResult) {
  const builder: any = {
    order() {
      return builder;
    },
    eq() {
      return builder;
    },
    select() {
      return builder;
    },
    single() {
      return Promise.resolve(result);
    },
    then(resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
    catch(reject: (reason: unknown) => unknown) {
      return Promise.resolve(result).catch(reject);
    },
  };

  return builder;
}

function createNoopSupabaseClient() {
  const noConfigError = { message: 'Supabase no configurado', code: 'NO_CONFIG' };
  return {
    from() {
      return {
        select() {
          return createNoopResult({ data: [], error: null });
        },
        insert() {
          return {
            select() {
              return createNoopResult({ data: null, error: noConfigError });
            },
          };
        },
        update() {
          return createNoopResult({ data: null, error: noConfigError });
        },
        delete() {
          return createNoopResult({ data: null, error: noConfigError });
        },
      };
    },
  };
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : (createNoopSupabaseClient() as ReturnType<typeof createNoopSupabaseClient>);

export const publicSupabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : (createNoopSupabaseClient() as ReturnType<typeof createNoopSupabaseClient>);
