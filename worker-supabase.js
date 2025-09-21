// Cloudflare Worker for Brother's Points System with Supabase Integration
// This worker acts as a proxy to your Supabase database

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Supabase configuration
    const SUPABASE_URL = env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

    // Route handling
    if (path === '/api/user-data') {
      return handleGetUserData(SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    if (path === '/api/tasks') {
      return handleGetTasks(SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    if (path === '/api/shop-items') {
      return handleGetShopItems(SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    if (path === '/api/complete-task') {
      return handleCompleteTask(request, SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    if (path === '/api/purchase-item') {
      return handlePurchaseItem(request, SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    if (path === '/api/reset') {
      return handleReset(request, SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    if (path === '/api/dashboard') {
      return handleGetDashboard(request, SUPABASE_URL, SUPABASE_ANON_KEY, corsHeaders);
    }

    // Serve the points page
    if (path === '/' || path === '/points') {
      return servePointsPage(corsHeaders);
    }

    // 404 for unknown routes
    return new Response('Not Found', { 
      status: 404, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  },
};

// Helper function to make Supabase API calls
async function supabaseRequest(url, key, endpoint, method = 'GET', body = null) {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  const options = {
    method,
    headers
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${url}/rest/v1/${endpoint}`, options);
  return response;
}

// Get user data
async function handleGetUserData(supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const response = await supabaseRequest(
      supabaseUrl, 
      supabaseKey, 
      'users?username=eq.brother&select=*'
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    const user = data[0];

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get completed tasks
    const tasksResponse = await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      `user_tasks?user_id=eq.${user.id}&select=task_id`
    );

    const completedTasks = tasksResponse.ok ? await tasksResponse.json() : [];

    // Get purchased items
    const itemsResponse = await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      `user_purchases?user_id=eq.${user.id}&select=item_id`
    );

    const purchasedItems = itemsResponse.ok ? await itemsResponse.json() : [];

    const result = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      points: user.points,
      totalEarned: user.total_earned,
      totalSpent: user.total_spent,
      tasksCompleted: user.tasks_completed,
      itemsPurchased: user.items_purchased,
      completedTasks: completedTasks.map(t => t.task_id),
      purchasedItems: purchasedItems.map(i => i.item_id)
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get tasks
async function handleGetTasks(supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const response = await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      'tasks?is_active=eq.true&select=*&order=points.asc'
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get shop items
async function handleGetShopItems(supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const response = await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      'shop_items?is_active=eq.true&select=*&order=price.asc'
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting shop items:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch shop items' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Complete a task
async function handleCompleteTask(request, supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const { taskId, userId } = await request.json();

    // Call the complete_task function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/complete_task`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_task_id: taskId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return new Response(JSON.stringify({ error: 'Failed to complete task' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Purchase an item
async function handlePurchaseItem(request, supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const { itemId, userId } = await request.json();

    // Call the purchase_item function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/purchase_item`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_item_id: itemId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    return new Response(JSON.stringify({ error: 'Failed to purchase item' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Reset user progress
async function handleReset(request, supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const { userId } = await request.json();

    // Reset user data
    const userResponse = await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      `users?id=eq.${userId}`,
      'PATCH',
      {
        points: 0,
        total_earned: 0,
        total_spent: 0,
        tasks_completed: 0,
        items_purchased: 0
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Failed to reset user data: ${userResponse.status}`);
    }

    // Delete completed tasks
    await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      `user_tasks?user_id=eq.${userId}`,
      'DELETE'
    );

    // Delete purchased items
    await supabaseRequest(
      supabaseUrl,
      supabaseKey,
      `user_purchases?user_id=eq.${userId}`,
      'DELETE'
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to reset progress' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get dashboard data
async function handleGetDashboard(request, supabaseUrl, supabaseKey, corsHeaders) {
  try {
    const { userId } = await request.json();

    // Call the get_user_dashboard function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_dashboard`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: userId
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Serve the points page
async function servePointsPage(corsHeaders) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Brother's Points System</title>
    <meta http-equiv="refresh" content="0; url=https://app.joshi1.com/points-supabase.html">
</head>
<body>
    <p>Redirecting to the points system...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'text/html' }
  });
}
