CREATE OR REPLACE FUNCTION current_user_id() 
RETURNS INT AS $$
BEGIN 
RETURN COALESCE(NULLIF(current_setting('app.current_user_id', true), ''), '0')::INT;
END;
$$ LANGUAGE plpgsql;