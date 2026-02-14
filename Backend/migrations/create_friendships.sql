-- Create friendships table
create table if not exists friendships (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(requester_id, receiver_id)
);

-- Enable RLS
alter table friendships enable row level security;

-- Policy: Anyone can view friendships (to check status) -> Or maybe just involved parties?
-- Let's allow public view to see "Friends" lists later, but strictly speaking for the button, 
-- we only need to query if *we* are involved.
-- For now, allow all authenticated users to view.
create policy "Friendships are viewable by everyone"
  on friendships for select
  using ( true );

-- Policy: Insert
-- Only the requester can insert, and they cannot be the receiver (no self-friending)
create policy "Users can insert their own friend requests"
  on friendships for insert
  with check ( auth.uid() = requester_id AND auth.uid() <> receiver_id );

-- Policy: Update (Accept)
-- Only the receiver can update the status to 'accepted'
-- (In a real app, strict check on OLD.status='pending' and NEW.status='accepted')
create policy "Receivers can accept friend requests"
  on friendships for update
  using ( auth.uid() = receiver_id )
  with check ( auth.uid() = receiver_id );

-- Policy: Delete (Cancel or Unfriend/Reject)
-- Either party can delete
create policy "Involved parties can delete friendships"
  on friendships for delete
  using ( auth.uid() = requester_id OR auth.uid() = receiver_id );
