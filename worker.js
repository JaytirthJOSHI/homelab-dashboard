// Cloudflare Worker for Brother's Points System API
// Deploy this to Cloudflare Workers and update the API_BASE URL in points.html

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Route handling
    if (path === '/api/user-data') {
      if (request.method === 'GET') {
        return handleGetUserData(corsHeaders);
      } else if (request.method === 'POST') {
        return handleUpdateUserData(request, corsHeaders);
      }
    }

    if (path === '/api/tasks') {
      return handleGetTasks(corsHeaders);
    }

    if (path === '/api/shop-items') {
      return handleGetShopItems(corsHeaders);
    }

    if (path === '/api/complete-task') {
      return handleCompleteTask(request, corsHeaders);
    }

    if (path === '/api/purchase-item') {
      return handlePurchaseItem(request, corsHeaders);
    }

    if (path === '/api/reset') {
      return handleReset(corsHeaders);
    }

    // Serve the points.html file for the root path
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

// Default user data structure
const defaultUserData = {
  points: 0,
  totalEarned: 0,
  totalSpent: 0,
  tasksCompleted: 0,
  itemsPurchased: 0,
  completedTasks: [],
  purchasedItems: []
};

// Sample tasks data
const tasks = [
  {
    id: 'dishes',
    title: 'Wash Dishes',
    description: 'Clean all dishes and put them away',
    points: 10,
    category: 'chores'
  },
  {
    id: 'trash',
    title: 'Take Out Trash',
    description: 'Empty all trash cans and take to curb',
    points: 15,
    category: 'chores'
  },
  {
    id: 'laundry',
    title: 'Do Laundry',
    description: 'Wash, dry, and fold one load of laundry',
    points: 20,
    category: 'chores'
  },
  {
    id: 'homework',
    title: 'Complete Homework',
    description: 'Finish all assigned homework for the day',
    points: 25,
    category: 'academic'
  },
  {
    id: 'exercise',
    title: 'Exercise for 30 minutes',
    description: 'Do any form of exercise for at least 30 minutes',
    points: 30,
    category: 'health'
  },
  {
    id: 'help_sibling',
    title: 'Help Sibling',
    description: 'Help your sibling with their homework or chores',
    points: 35,
    category: 'family'
  }
];

// Sample shop items data
const shopItems = [
  {
    id: 'extra_screen_time',
    title: 'Extra Screen Time',
    description: '30 minutes of additional screen time',
    price: 20,
    category: 'privileges'
  },
  {
    id: 'choose_dinner',
    title: 'Choose Dinner',
    description: 'Pick what the family has for dinner',
    price: 30,
    category: 'privileges'
  },
  {
    id: 'skip_chore',
    title: 'Skip One Chore',
    description: 'Skip any one chore for the day',
    price: 40,
    category: 'privileges'
  },
  {
    id: 'movie_night',
    title: 'Movie Night Choice',
    description: 'Choose the movie for family movie night',
    price: 50,
    category: 'privileges'
  },
  {
    id: 'sleepover',
    title: 'Sleepover with Friends',
    description: 'Have friends over for a sleepover',
    price: 100,
    category: 'special'
  },
  {
    id: 'new_game',
    title: 'New Video Game',
    description: 'Get a new video game (up to $30)',
    price: 150,
    category: 'purchases'
  }
];

// Get user data
async function handleGetUserData(corsHeaders) {
  try {
    // In a real implementation, you'd fetch from a database
    // For now, we'll return default data
    const userData = { ...defaultUserData };
    
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Update user data
async function handleUpdateUserData(request, corsHeaders) {
  try {
    const userData = await request.json();
    
    // In a real implementation, you'd save to a database
    // For now, we'll just return the data
    
    return new Response(JSON.stringify({ success: true, data: userData }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update user data' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Get tasks
async function handleGetTasks(corsHeaders) {
  return new Response(JSON.stringify(tasks), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// Get shop items
async function handleGetShopItems(corsHeaders) {
  return new Response(JSON.stringify(shopItems), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// Complete a task
async function handleCompleteTask(request, corsHeaders) {
  try {
    const { taskId, userData } = await request.json();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Update user data
    const updatedUserData = { ...userData };
    if (!updatedUserData.completedTasks.includes(taskId)) {
      updatedUserData.completedTasks.push(taskId);
      updatedUserData.points += task.points;
      updatedUserData.totalEarned += task.points;
      updatedUserData.tasksCompleted += 1;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      userData: updatedUserData,
      pointsEarned: task.points
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to complete task' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Purchase an item
async function handlePurchaseItem(request, corsHeaders) {
  try {
    const { itemId, userData } = await request.json();
    
    const item = shopItems.find(i => i.id === itemId);
    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if user has enough points
    if (userData.points < item.price) {
      return new Response(JSON.stringify({ error: 'Not enough points' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if already purchased
    if (userData.purchasedItems.includes(itemId)) {
      return new Response(JSON.stringify({ error: 'Item already purchased' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Update user data
    const updatedUserData = { ...userData };
    updatedUserData.purchasedItems.push(itemId);
    updatedUserData.points -= item.price;
    updatedUserData.totalSpent += item.price;
    updatedUserData.itemsPurchased += 1;

    return new Response(JSON.stringify({ 
      success: true, 
      userData: updatedUserData,
      itemPurchased: item
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to purchase item' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Reset user data
async function handleReset(corsHeaders) {
  return new Response(JSON.stringify({ 
    success: true, 
    userData: defaultUserData 
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// Serve the points page
async function servePointsPage(corsHeaders) {
  // In a real implementation, you'd serve the HTML file
  // For now, we'll return a simple response
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Brother's Points System</title>
    <meta http-equiv="refresh" content="0; url=https://app.joshi1.com/points.html">
</head>
<body>
    <p>Redirecting to the points system...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html',
    },
  });
}
