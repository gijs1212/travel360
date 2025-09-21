select auth.admin.create_user(
  email => 'gijs@travel360.app',
  password => 'Gijs1212',
  email_confirm => true,
  user_metadata => jsonb_build_object(
    'username', 'Gijs',
    'role', 'uploader'
  )
);

update public.profiles
set
  username = 'Gijs',
  email = 'gijs@travel360.app',
  role = 'uploader'
where id = (select id from auth.users where email = 'gijs@travel360.app');
