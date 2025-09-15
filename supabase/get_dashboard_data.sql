create or replace function get_dashboard_data(user_id uuid) 
returns table(total_polls bigint, total_votes bigint, total_views bigint) as $$
begin
  return query
  select
    (select count(*) from polls where polls.user_id = $1) as total_polls,
    (select count(*) from votes where votes.poll_id in (select id from polls where polls.user_id = $1)) as total_votes,
    (select sum(view_count) from polls where polls.user_id = $1) as total_views;
end; 
$$ language plpgsql; 
