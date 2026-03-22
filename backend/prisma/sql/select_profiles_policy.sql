CREATE POLICY select_profiles_policy ON "Profile" 
FOR SELECT 
USING (
    "userId" NOT IN (
        SELECT "banningUserId" 
        FROM "Ban" 
        WHERE "bannedUserId" = (current_setting('app.current_user_id', true)::INT)
    )
);
