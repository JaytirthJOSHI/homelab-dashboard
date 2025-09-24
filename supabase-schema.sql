-- Supabase Database Schema for Beacon Points
-- Run these commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.joshi1.com" = 'beacon-points';

-- Add image_url column to existing shop_items table if it doesn't exist
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    total_earned INTEGER DEFAULT 0 NOT NULL,
    total_spent INTEGER DEFAULT 0 NOT NULL,
    tasks_completed INTEGER DEFAULT 0 NOT NULL,
    items_purchased INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop_items table
CREATE TABLE IF NOT EXISTS shop_items (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_tasks table (track completed tasks)
CREATE TABLE IF NOT EXISTS user_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER NOT NULL,
    UNIQUE(user_id, task_id)
);

-- Create user_purchases table (track purchased items)
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(50) REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_spent INTEGER NOT NULL,
    UNIQUE(user_id, item_id)
);

-- Create user_activity table (audit log)
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'task_completed', 'item_purchased', 'points_added', 'points_deducted'
    description TEXT NOT NULL,
    points_change INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fulfillment_tasks table
CREATE TABLE IF NOT EXISTS fulfillment_tasks (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(50) REFERENCES shop_items(id) ON DELETE CASCADE,
    item_title VARCHAR(100) NOT NULL,
    item_description TEXT NOT NULL,
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'fulfilled', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user (default profile)
INSERT INTO users (username, display_name, points, total_earned) 
VALUES ('brother', 'Brother', 0, 0)
ON CONFLICT (username) DO UPDATE SET
    points = 0,
    total_earned = 0,
    updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON user_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop_items(category);
CREATE INDEX IF NOT EXISTS idx_fulfillment_tasks_user_id ON fulfillment_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_tasks_status ON fulfillment_tasks(status);
CREATE INDEX IF NOT EXISTS idx_fulfillment_tasks_created_at ON fulfillment_tasks(created_at);

-- Create functions for common operations

-- Function to complete a task
CREATE OR REPLACE FUNCTION complete_task(
    p_user_id UUID,
    p_task_id VARCHAR(50)
) RETURNS JSON AS $$
DECLARE
    task_record tasks%ROWTYPE;
    user_record users%ROWTYPE;
    result JSON;
BEGIN
    -- Get task details
    SELECT * INTO task_record FROM tasks WHERE id = p_task_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Task not found');
    END IF;
    
    -- Check if already completed
    IF EXISTS (SELECT 1 FROM user_tasks WHERE user_id = p_user_id AND task_id = p_task_id) THEN
        RETURN json_build_object('success', false, 'error', 'Task already completed');
    END IF;
    
    -- Get user details
    SELECT * INTO user_record FROM users WHERE id = p_user_id;
    
    -- Insert task completion
    INSERT INTO user_tasks (user_id, task_id, points_earned)
    VALUES (p_user_id, p_task_id, task_record.points);
    
    -- Update user points
    UPDATE users SET
        points = points + task_record.points,
        total_earned = total_earned + task_record.points,
        tasks_completed = tasks_completed + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log activity
    INSERT INTO user_activity (user_id, activity_type, description, points_change)
    VALUES (p_user_id, 'task_completed', 'Completed task: ' || task_record.title, task_record.points);
    
    -- Return updated user data
    SELECT json_build_object(
        'success', true,
        'points_earned', task_record.points,
        'user_data', json_build_object(
            'points', points + task_record.points,
            'total_earned', total_earned + task_record.points,
            'tasks_completed', tasks_completed + 1
        )
    ) INTO result
    FROM users WHERE id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to purchase an item
CREATE OR REPLACE FUNCTION purchase_item(
    p_user_id UUID,
    p_item_id VARCHAR(50)
) RETURNS JSON AS $$
DECLARE
    item_record shop_items%ROWTYPE;
    user_record users%ROWTYPE;
    result JSON;
BEGIN
    -- Get item details
    SELECT * INTO item_record FROM shop_items WHERE id = p_item_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Get user details
    SELECT * INTO user_record FROM users WHERE id = p_user_id;
    
    -- Check if user has enough points
    IF user_record.points < item_record.price THEN
        RETURN json_build_object('success', false, 'error', 'Not enough points');
    END IF;
    
    -- Check if already purchased
    IF EXISTS (SELECT 1 FROM user_purchases WHERE user_id = p_user_id AND item_id = p_item_id) THEN
        RETURN json_build_object('success', false, 'error', 'Item already purchased');
    END IF;
    
    -- Insert purchase
    INSERT INTO user_purchases (user_id, item_id, points_spent)
    VALUES (p_user_id, p_item_id, item_record.price);
    
    -- Update user points
    UPDATE users SET
        points = points - item_record.price,
        total_spent = total_spent + item_record.price,
        items_purchased = items_purchased + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log activity
    INSERT INTO user_activity (user_id, activity_type, description, points_change)
    VALUES (p_user_id, 'item_purchased', 'Purchased: ' || item_record.title, -item_record.price);
    
    -- Return updated user data
    SELECT json_build_object(
        'success', true,
        'points_spent', item_record.price,
        'user_data', json_build_object(
            'points', points - item_record.price,
            'total_spent', total_spent + item_record.price,
            'items_purchased', items_purchased + 1
        )
    ) INTO result
    FROM users WHERE id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID) RETURNS JSON AS $$
DECLARE
    user_record users%ROWTYPE;
    completed_tasks TEXT[];
    purchased_items TEXT[];
    result JSON;
BEGIN
    -- Get user data
    SELECT * INTO user_record FROM users WHERE id = p_user_id;
    
    -- Get completed tasks
    SELECT ARRAY_AGG(task_id) INTO completed_tasks
    FROM user_tasks WHERE user_id = p_user_id;
    
    -- Get purchased items
    SELECT ARRAY_AGG(item_id) INTO purchased_items
    FROM user_purchases WHERE user_id = p_user_id;
    
    -- Build result
    SELECT json_build_object(
        'user', json_build_object(
            'id', user_record.id,
            'username', user_record.username,
            'display_name', user_record.display_name,
            'points', user_record.points,
            'total_earned', user_record.total_earned,
            'total_spent', user_record.total_spent,
            'tasks_completed', user_record.tasks_completed,
            'items_purchased', user_record.items_purchased
        ),
        'completed_tasks', COALESCE(completed_tasks, ARRAY[]::TEXT[]),
        'purchased_items', COALESCE(purchased_items, ARRAY[]::TEXT[])
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, you can restrict later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on shop_items" ON shop_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_tasks" ON user_tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_purchases" ON user_purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_activity" ON user_activity FOR ALL USING (true);
CREATE POLICY "Allow all operations on fulfillment_tasks" ON fulfillment_tasks FOR ALL USING (true);




