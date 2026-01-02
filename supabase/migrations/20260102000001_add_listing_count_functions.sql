-- Add RPC functions for incrementing/decrementing listing counts

-- Function to increment save count
CREATE OR REPLACE FUNCTION increment_listing_save_count(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET save_count = COALESCE(save_count, 0) + 1
  WHERE id = listing_id;
END;
$$;

-- Function to decrement save count
CREATE OR REPLACE FUNCTION decrement_listing_save_count(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET save_count = GREATEST(COALESCE(save_count, 0) - 1, 0)
  WHERE id = listing_id;
END;
$$;
