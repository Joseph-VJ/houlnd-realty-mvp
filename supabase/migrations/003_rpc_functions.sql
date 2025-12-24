-- =====================================================
-- Houlnd Realty - Database RPC Functions
-- =====================================================
-- This migration creates reusable database functions (RPCs)
-- that can be called from the application via Supabase client.
--
-- Execute this AFTER 002_rls_policies.sql
-- =====================================================

-- =====================================================
-- SECURITY: CONTACT GATING
-- =====================================================

-- Function to get listing contact information
-- Returns masked phone if not unlocked, full phone if unlocked
-- This is the PRIMARY security function for the gated contact feature
CREATE OR REPLACE FUNCTION get_listing_contact(
  p_listing_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  unlocked BOOLEAN,
  masked_phone TEXT,
  phone_e164 TEXT,
  promoter_name TEXT,
  promoter_email TEXT
) AS $$
DECLARE
  v_promoter_phone TEXT;
  v_promoter_name TEXT;
  v_promoter_email TEXT;
  v_unlocked BOOLEAN;
BEGIN
  -- Default to current user if not specified
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  -- Get promoter contact info
  SELECT u.phone_e164, u.full_name, u.email
  INTO v_promoter_phone, v_promoter_name, v_promoter_email
  FROM public.listings l
  JOIN public.users u ON u.id = l.promoter_id
  WHERE l.id = p_listing_id;

  -- Check if user has unlocked this listing
  SELECT EXISTS (
    SELECT 1 FROM public.unlocks
    WHERE user_id = p_user_id AND listing_id = p_listing_id
  ) INTO v_unlocked;

  -- Return masked or full contact based on unlock status
  RETURN QUERY
  SELECT
    v_unlocked AS unlocked,
    CASE
      WHEN v_promoter_phone IS NULL THEN ''
      WHEN LENGTH(v_promoter_phone) <= 6 THEN REPEAT('*', LENGTH(v_promoter_phone))
      ELSE
        -- Format: +91******10 (show first 3 and last 2 digits)
        SUBSTRING(v_promoter_phone FROM 1 FOR 3) ||
        REPEAT('*', GREATEST(0, LENGTH(v_promoter_phone) - 5)) ||
        SUBSTRING(v_promoter_phone FROM LENGTH(v_promoter_phone) - 1)
    END AS masked_phone,
    CASE
      WHEN v_unlocked THEN v_promoter_phone
      ELSE NULL
    END AS phone_e164,
    v_promoter_name AS promoter_name,
    CASE
      WHEN v_unlocked THEN v_promoter_email
      ELSE NULL
    END AS promoter_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_listing_contact IS 'Get promoter contact info - masked if not unlocked, full if unlocked';

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Function to create a notification
-- Used by triggers and application code to send notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link_url, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link_url, COALESCE(p_metadata, '{}'::jsonb))
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_notification IS 'Create a notification for a user';

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Default to current user
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_all_notifications_read IS 'Mark all notifications as read for a user';

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
BEGIN
  -- Default to current user
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = p_user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_unread_notification_count IS 'Get count of unread notifications for a user';

-- =====================================================
-- DASHBOARD STATISTICS
-- =====================================================

-- Function to get dashboard statistics based on user role
-- Returns role-specific stats in JSON format
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_role user_role;
  v_stats JSONB;
BEGIN
  -- Default to current user
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  -- Get user role
  SELECT role INTO v_role FROM public.users WHERE id = p_user_id;

  -- Return role-specific statistics
  IF v_role = 'PROMOTER' THEN
    SELECT jsonb_build_object(
      'role', 'PROMOTER',
      'total_listings', COUNT(*),
      'draft_listings', COUNT(*) FILTER (WHERE status = 'DRAFT'),
      'pending_listings', COUNT(*) FILTER (WHERE status = 'PENDING_VERIFICATION'),
      'live_listings', COUNT(*) FILTER (WHERE status = 'LIVE'),
      'rejected_listings', COUNT(*) FILTER (WHERE status = 'REJECTED'),
      'inactive_listings', COUNT(*) FILTER (WHERE status = 'INACTIVE'),
      'sold_listings', COUNT(*) FILTER (WHERE status = 'SOLD'),
      'total_views', COALESCE(SUM(view_count), 0),
      'total_saves', COALESCE(SUM(save_count), 0),
      'total_unlocks', (
        SELECT COUNT(*)
        FROM public.unlocks u
        JOIN public.listings l ON l.id = u.listing_id
        WHERE l.promoter_id = p_user_id
      ),
      'total_unlocks_revenue_paise', (
        SELECT COALESCE(SUM(po.amount_paise), 0)
        FROM public.payment_orders po
        JOIN public.listings l ON l.id = po.listing_id
        WHERE l.promoter_id = p_user_id AND po.status IN ('PAID', 'SUCCESS')
      ),
      'upcoming_appointments', (
        SELECT COUNT(*)
        FROM public.appointments a
        JOIN public.listings l ON l.id = a.listing_id
        WHERE l.promoter_id = p_user_id
          AND a.status IN ('PENDING', 'CONFIRMED')
          AND a.scheduled_start > NOW()
      ),
      'past_appointments', (
        SELECT COUNT(*)
        FROM public.appointments a
        JOIN public.listings l ON l.id = a.listing_id
        WHERE l.promoter_id = p_user_id
          AND (a.status = 'COMPLETED' OR a.scheduled_start < NOW())
      )
    ) INTO v_stats
    FROM public.listings
    WHERE promoter_id = p_user_id AND deleted_at IS NULL;

  ELSIF v_role = 'CUSTOMER' THEN
    SELECT jsonb_build_object(
      'role', 'CUSTOMER',
      'saved_properties', (
        SELECT COUNT(*) FROM public.saved_properties WHERE user_id = p_user_id
      ),
      'unlocked_properties', (
        SELECT COUNT(*) FROM public.unlocks WHERE user_id = p_user_id
      ),
      'total_spent_paise', (
        SELECT COALESCE(SUM(amount_paise), 0)
        FROM public.payment_orders
        WHERE user_id = p_user_id AND status IN ('PAID', 'SUCCESS')
      ),
      'upcoming_appointments', (
        SELECT COUNT(*)
        FROM public.appointments
        WHERE customer_id = p_user_id
          AND status IN ('PENDING', 'CONFIRMED')
          AND scheduled_start > NOW()
      ),
      'past_appointments', (
        SELECT COUNT(*)
        FROM public.appointments
        WHERE customer_id = p_user_id
          AND (status = 'COMPLETED' OR scheduled_start < NOW())
      ),
      'unread_notifications', (
        SELECT COUNT(*) FROM public.notifications
        WHERE user_id = p_user_id AND is_read = FALSE
      )
    ) INTO v_stats;

  ELSIF v_role = 'ADMIN' THEN
    SELECT jsonb_build_object(
      'role', 'ADMIN',
      'total_users', (SELECT COUNT(*) FROM public.users),
      'total_customers', (SELECT COUNT(*) FROM public.users WHERE role = 'CUSTOMER'),
      'total_promoters', (SELECT COUNT(*) FROM public.users WHERE role = 'PROMOTER'),
      'total_admins', (SELECT COUNT(*) FROM public.users WHERE role = 'ADMIN'),
      'blocked_users', (SELECT COUNT(*) FROM public.users WHERE is_blocked = TRUE),
      'total_listings', (SELECT COUNT(*) FROM public.listings WHERE deleted_at IS NULL),
      'draft_listings', (SELECT COUNT(*) FROM public.listings WHERE status = 'DRAFT'),
      'pending_listings', (SELECT COUNT(*) FROM public.listings WHERE status = 'PENDING_VERIFICATION'),
      'live_listings', (SELECT COUNT(*) FROM public.listings WHERE status = 'LIVE'),
      'rejected_listings', (SELECT COUNT(*) FROM public.listings WHERE status = 'REJECTED'),
      'inactive_listings', (SELECT COUNT(*) FROM public.listings WHERE status = 'INACTIVE'),
      'sold_listings', (SELECT COUNT(*) FROM public.listings WHERE status = 'SOLD'),
      'total_unlocks', (SELECT COUNT(*) FROM public.unlocks),
      'total_revenue_paise', (
        SELECT COALESCE(SUM(amount_paise), 0)
        FROM public.payment_orders
        WHERE status IN ('PAID', 'SUCCESS')
      ),
      'total_appointments', (SELECT COUNT(*) FROM public.appointments),
      'pending_appointments', (
        SELECT COUNT(*) FROM public.appointments WHERE status = 'PENDING'
      ),
      'users_registered_last_30_days', (
        SELECT COUNT(*) FROM public.users WHERE created_at > NOW() - INTERVAL '30 days'
      ),
      'listings_posted_last_30_days', (
        SELECT COUNT(*) FROM public.listings
        WHERE created_at > NOW() - INTERVAL '30 days'
      ),
      'revenue_last_30_days_paise', (
        SELECT COALESCE(SUM(amount_paise), 0)
        FROM public.payment_orders
        WHERE status IN ('PAID', 'SUCCESS')
          AND paid_at > NOW() - INTERVAL '30 days'
      )
    ) INTO v_stats;

  ELSE
    v_stats := '{}'::jsonb;
  END IF;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_dashboard_stats IS 'Get role-specific dashboard statistics for a user';

-- =====================================================
-- SEARCH & DISCOVERY
-- =====================================================

-- Function to increment view count on a listing
CREATE OR REPLACE FUNCTION increment_listing_view(
  p_listing_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_listing_view IS 'Increment the view count for a listing';

-- Function to toggle saved property (save if not saved, unsave if saved)
CREATE OR REPLACE FUNCTION toggle_saved_property(
  p_listing_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
  v_saved_price INTEGER;
BEGIN
  -- Default to current user
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  -- Check if already saved
  SELECT EXISTS (
    SELECT 1 FROM public.saved_properties
    WHERE user_id = p_user_id AND listing_id = p_listing_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Unsave (delete)
    DELETE FROM public.saved_properties
    WHERE user_id = p_user_id AND listing_id = p_listing_id;

    -- Decrement save count
    UPDATE public.listings SET save_count = save_count - 1 WHERE id = p_listing_id;

    RETURN FALSE;  -- Unsaved
  ELSE
    -- Get current price
    SELECT total_price INTO v_saved_price FROM public.listings WHERE id = p_listing_id;

    -- Save (insert)
    INSERT INTO public.saved_properties (user_id, listing_id, saved_price)
    VALUES (p_user_id, p_listing_id, v_saved_price);

    -- Increment save count
    UPDATE public.listings SET save_count = save_count + 1 WHERE id = p_listing_id;

    RETURN TRUE;  -- Saved
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_saved_property IS 'Toggle saved status of a property for a user';

-- =====================================================
-- ADMIN FUNCTIONS
-- =====================================================

-- Function to approve a listing (admin only)
CREATE OR REPLACE FUNCTION approve_listing(
  p_listing_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_promoter_id UUID;
  v_listing_title TEXT;
BEGIN
  -- Default to current user
  IF p_admin_id IS NULL THEN
    p_admin_id := auth.uid();
  END IF;

  -- Verify admin role
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve listings';
  END IF;

  -- Get listing details
  SELECT promoter_id, title INTO v_promoter_id, v_listing_title
  FROM public.listings
  WHERE id = p_listing_id;

  -- Update listing status
  UPDATE public.listings
  SET
    status = 'LIVE',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    rejection_reason = NULL
  WHERE id = p_listing_id;

  -- Create notification for promoter
  PERFORM create_notification(
    v_promoter_id,
    'LISTING_APPROVED',
    'Listing Approved!',
    'Your property listing "' || COALESCE(v_listing_title, 'Untitled') || '" has been approved and is now LIVE.',
    '/promoter/listings/' || p_listing_id::TEXT
  );

  -- Log activity
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    p_admin_id,
    'LISTING_APPROVED',
    'LISTING',
    p_listing_id,
    jsonb_build_object('listing_id', p_listing_id, 'promoter_id', v_promoter_id)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION approve_listing IS 'Approve a listing and send notification to promoter (admin only)';

-- Function to reject a listing (admin only)
CREATE OR REPLACE FUNCTION reject_listing(
  p_listing_id UUID,
  p_rejection_reason TEXT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_promoter_id UUID;
  v_listing_title TEXT;
BEGIN
  -- Default to current user
  IF p_admin_id IS NULL THEN
    p_admin_id := auth.uid();
  END IF;

  -- Verify admin role
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject listings';
  END IF;

  -- Get listing details
  SELECT promoter_id, title INTO v_promoter_id, v_listing_title
  FROM public.listings
  WHERE id = p_listing_id;

  -- Update listing status
  UPDATE public.listings
  SET
    status = 'REJECTED',
    reviewed_at = NOW(),
    reviewed_by = p_admin_id,
    rejection_reason = p_rejection_reason
  WHERE id = p_listing_id;

  -- Create notification for promoter
  PERFORM create_notification(
    v_promoter_id,
    'LISTING_REJECTED',
    'Listing Rejected',
    'Your property listing "' || COALESCE(v_listing_title, 'Untitled') || '" has been rejected. Reason: ' || p_rejection_reason,
    '/promoter/listings/' || p_listing_id::TEXT,
    jsonb_build_object('rejection_reason', p_rejection_reason)
  );

  -- Log activity
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    p_admin_id,
    'LISTING_REJECTED',
    'LISTING',
    p_listing_id,
    jsonb_build_object(
      'listing_id', p_listing_id,
      'promoter_id', v_promoter_id,
      'rejection_reason', p_rejection_reason
    )
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reject_listing IS 'Reject a listing with reason and send notification to promoter (admin only)';

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to clean up old notifications (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_old INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND is_read = TRUE;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_notifications IS 'Delete read notifications older than specified days (default 90)';

-- Function to get popular cities (for search filters)
CREATE OR REPLACE FUNCTION get_popular_cities(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  city TEXT,
  listing_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.city,
    COUNT(*) AS listing_count
  FROM public.listings l
  WHERE l.status = 'LIVE'
    AND l.deleted_at IS NULL
    AND l.city IS NOT NULL
  GROUP BY l.city
  ORDER BY listing_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_popular_cities IS 'Get list of cities with most LIVE listings';

-- =====================================================
-- GRANT EXECUTE PERMISSIONS
-- =====================================================

-- Grant execute permission to authenticated users for all functions
GRANT EXECUTE ON FUNCTION get_listing_contact TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_view TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_saved_property TO authenticated;
GRANT EXECUTE ON FUNCTION approve_listing TO authenticated;
GRANT EXECUTE ON FUNCTION reject_listing TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications TO service_role;
GRANT EXECUTE ON FUNCTION get_popular_cities TO authenticated, anon;

-- =====================================================
-- END OF RPC FUNCTIONS
-- =====================================================
