-- uniOrganiza — seed the real subjects (GIIN, 1º/2º).
-- Run AFTER 0001_init.sql and AFTER you have signed up once (so an auth user
-- exists). Assigns every row to the first/only user in auth.users.
-- Safe to re-run: does nothing if the subjects are already present.

do $$
declare
  uid uuid;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then
    raise exception 'No auth user yet — sign up in the app first.';
  end if;

  insert into public.subjects (user_id, name, color, external_ref)
  select uid, v.name, v.color, v.ref
  from (values
    ('Cálculo',                                   '#7aa2f7', '80346'),
    ('Fundamentos de Computadores',               '#bb9af7', '80348'),
    ('Organización y Gestión de Empresas',        '#e0af68', '80352'),
    ('Tecnología y Organización de Computadores', '#7dcfff', '80353'),
    ('Interfaces usuario / computador',           '#9ece6a', '80357'),
    ('Fundamentos de Ingeniería de Software',     '#f7768e', '80361')
  ) as v(name, color, ref)
  where not exists (
    select 1 from public.subjects s
    where s.user_id = uid and s.external_ref = v.ref
  );
end $$;
