import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

interface ProductData {
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category: string;
  inventory: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  is_customizable?: boolean;
  is_trending?: boolean;
  is_featured?: boolean;
  discount_percentage?: number;
  material?: string;
  tags?: string[];
}

// GET handler for browser access - shows API documentation
export async function GET(request: NextRequest) {
  const htmlResponse = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add Product API - POST Only</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .header p {
      opacity: 0.9;
      font-size: 18px;
    }
    .content {
      padding: 32px;
    }
    .error-box {
      background: #fee;
      border-left: 4px solid #e53e3e;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 4px;
    }
    .error-box h3 {
      color: #c53030;
      margin-bottom: 8px;
      font-size: 18px;
    }
    .error-box p {
      color: #742a2a;
      line-height: 1.6;
    }
    .info-box {
      background: #e6f7ff;
      border-left: 4px solid #1890ff;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 4px;
    }
    .info-box h3 {
      color: #0050b3;
      margin-bottom: 8px;
      font-size: 18px;
    }
    .info-box p {
      color: #003a8c;
      line-height: 1.6;
    }
    .method-badge {
      display: inline-block;
      background: #2ecc71;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14px;
      margin-right: 8px;
    }
    .method-badge.get {
      background: #3498db;
    }
    .code-block {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
    }
    .code-block .comment {
      color: #6272a4;
    }
    .code-block .string {
      color: #f1fa8c;
    }
    .code-block .keyword {
      color: #ff79c6;
    }
    h2 {
      color: #2c3e50;
      margin: 24px 0 16px;
      font-size: 24px;
    }
    h3 {
      color: #34495e;
      margin: 16px 0 12px;
      font-size: 18px;
    }
    ul {
      margin: 12px 0;
      padding-left: 24px;
    }
    li {
      margin: 8px 0;
      line-height: 1.6;
      color: #555;
    }
    .required {
      color: #e53e3e;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 16px;
      transition: background 0.3s;
    }
    .button:hover {
      background: #5568d3;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ POST Method Required</h1>
      <p>Add Product API Endpoint</p>
    </div>
    <div class="content">
      <div class="error-box">
        <h3>❌ Cannot Use Browser Address Bar</h3>
        <p>This endpoint only accepts <strong>POST</strong> requests with JSON data. Browser address bars send <strong>GET</strong> requests, which are not supported for adding products.</p>
      </div>

      <div class="info-box">
        <h3>✅ How to Use This API</h3>
        <p>Use one of the following methods to send a POST request with JSON data:</p>
      </div>

      <h2>Method 1: PowerShell</h2>
      <div class="code-block">
<span class="comment"># Create product data</span>
<span class="keyword">$product</span> = @{
  title = <span class="string">"My Product"</span>
  price = 999
  category = <span class="string">"home-decor"</span>
  inventory = 10
  description = <span class="string">"A great product"</span>
} | ConvertTo-Json

<span class="comment"># Send POST request</span>
Invoke-RestMethod <span class="keyword">-Uri</span> <span class="string">"http://localhost:3000/api/products/add"</span> \`
  <span class="keyword">-Method</span> POST \`
  <span class="keyword">-Body</span> <span class="keyword">$product</span> \`
  <span class="keyword">-ContentType</span> <span class="string">"application/json"</span>
      </div>

      <h2>Method 2: JavaScript (Browser Console)</h2>
      <div class="code-block">
<span class="keyword">fetch</span>(<span class="string">"http://localhost:3000/api/products/add"</span>, {
  method: <span class="string">"POST"</span>,
  headers: { <span class="string">"Content-Type"</span>: <span class="string">"application/json"</span> },
  body: JSON.stringify({
    title: <span class="string">"My Product"</span>,
    price: 999,
    category: <span class="string">"home-decor"</span>,
    inventory: 10
  })
})
.then(res => res.json())
.then(data => console.log(data));
      </div>

      <h2>Method 3: cURL</h2>
      <div class="code-block">
curl -X POST http://localhost:3000/api/products/add \
  -H <span class="string">"Content-Type: application/json"</span> \
  -d <span class="string">'{"title":"My Product","price":999,"category":"home-decor","inventory":10}'</span>
      </div>

      <h2>📋 Required Fields</h2>
      <ul>
        <li><span class="required">title</span> (string) - Product name</li>
        <li><span class="required">price</span> (number) - Price in rupees (must be > 0)</li>
        <li><span class="required">category</span> (string) - Category (e.g., "home-decor", "table-top")</li>
        <li><span class="required">inventory</span> (number) - Stock count (must be ≥ 0)</li>
      </ul>

      <h2>📝 Optional Fields</h2>
      <ul>
        <li><strong>description</strong> (string) - Product description</li>
        <li><strong>images</strong> (array) - Array of image URLs</li>
        <li><strong>is_customizable</strong> (boolean) - Default: false</li>
        <li><strong>is_trending</strong> (boolean) - Default: false</li>
        <li><strong>is_featured</strong> (boolean) - Default: false</li>
        <li><strong>discount_percentage</strong> (number, 0-100) - Default: 0</li>
        <li><strong>material</strong> (string) - Material type</li>
        <li><strong>tags</strong> (array) - Array of tag strings</li>
      </ul>

      <a href="/api/products/list" class="button">📋 View All Products (GET)</a>
      <a href="/API_DOCUMENTATION.md" class="button">📖 Full API Documentation</a>
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(htmlResponse, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductData = await request.json();

    // Validate required fields
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Product title is required' },
        { status: 400 }
      );
    }

    if (!body.price || body.price <= 0) {
      return NextResponse.json(
        { error: 'Valid product price is required (must be greater than 0)' },
        { status: 400 }
      );
    }

    if (!body.category || body.category.trim() === '') {
      return NextResponse.json(
        { error: 'Product category is required' },
        { status: 400 }
      );
    }

    if (body.inventory === undefined || body.inventory < 0) {
      return NextResponse.json(
        { error: 'Valid inventory count is required (must be 0 or greater)' },
        { status: 400 }
      );
    }

    // Validate category format (should be lowercase with hyphens)
    const validCategoryFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!validCategoryFormat.test(body.category)) {
      return NextResponse.json(
        { error: 'Category must be lowercase with hyphens (e.g., "home-decor")' },
        { status: 400 }
      );
    }

    // Validate images array if provided
    if (body.images && !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: 'Images must be an array of URLs' },
        { status: 400 }
      );
    }

    // Validate discount percentage
    if (body.discount_percentage !== undefined && (body.discount_percentage < 0 || body.discount_percentage > 100)) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Prepare product data
    const productData: any = {
      id: uuidv4(),
      title: body.title.trim(),
      description: body.description?.trim() || '',
      price: Number(body.price),
      images: body.images || [],
      category: body.category.toLowerCase().trim(),
      inventory: Number(body.inventory),
      is_customizable: body.is_customizable || false,
      is_trending: body.is_trending || false,
      is_featured: body.is_featured || false,
      discount_percentage: body.discount_percentage || 0,
      material: body.material?.trim() || '',
      tags: body.tags || [],
      created_at: new Date().toISOString(),
    };

    // Try with dimensions first
    let insertData = { ...productData };
    if (body.dimensions) {
      insertData.dimensions = body.dimensions;
    }

    // Insert into Supabase
    let { data, error } = await supabaseAdmin
      .from('products')
      .insert(insertData)
      .select()
      .single();

    // If error is about dimensions column, retry without it
    if (error && error.message?.includes('dimensions') && error.message?.includes('schema cache')) {
      console.warn('Dimensions column not found, retrying without dimensions...');
      
      // Remove dimensions and try again
      const { dimensions, ...dataWithoutDimensions } = insertData;
      const retryResult = await supabaseAdmin
        .from('products')
        .insert(dataWithoutDimensions)
        .select()
        .single();
      
      data = retryResult.data;
      error = retryResult.error;
      
      if (!error) {
        console.warn('Product added without dimensions. Run FIX_PRODUCTS_DIMENSIONS.sql to add the column.');
      }
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Failed to add product: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product added successfully',
        product: data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

