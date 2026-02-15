import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/agents/provision
 * Provisions an agent instance for a customer
 * Called after successful payment/subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, name, customSettings } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check subscription & agent limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status, agent_limit')
      .eq('customer_id', customer.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Count existing agents
    const { count: agentCount } = await supabase
      .from('customer_agents')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
      .eq('status', 'active');

    const limit = subscription?.agent_limit || 1;
    if ((agentCount || 0) >= limit) {
      return NextResponse.json(
        { error: `Agent limit reached (${limit}). Upgrade your plan for more agents.` },
        { status: 403 }
      );
    }

    // Get template
    const { data: template } = await supabase
      .from('agent_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Provision agent
    const { data: agent, error: provisionError } = await supabase
      .from('customer_agents')
      .insert({
        customer_id: customer.id,
        template_id: templateId,
        name: name || template.name,
        icon: template.icon,
        status: 'active',
        custom_settings: customSettings || template.default_settings || {},
      })
      .select('id, name, api_key, status')
      .single();

    if (provisionError) {
      console.error('Provision error:', provisionError);
      return NextResponse.json({ error: 'Failed to provision agent' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        apiKey: agent.api_key,
        status: agent.status,
        templateId,
        embedCode: `<script src="https://agentify.ch/widget.js" data-agent="${agent.api_key}"></script>`,
      },
    });

  } catch (error) {
    console.error('Provision API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
