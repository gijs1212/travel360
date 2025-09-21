insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Signed access allowed" on storage.objects
  for select using (bucket_id = 'photos');

create policy "Uploader can upload" on storage.objects
  for insert with check (
    bucket_id = 'photos'
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'uploader'
    )
  );

create policy "Uploader can update" on storage.objects
  for update using (
    bucket_id = 'photos'
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'uploader'
    )
  );

create policy "Uploader can delete" on storage.objects
  for delete using (
    bucket_id = 'photos'
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'uploader'
    )
  );
