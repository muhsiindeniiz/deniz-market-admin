import { NextRequest, NextResponse } from 'next/server';
import { ONESIGNAL_APP_ID, DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/onesignal';

const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!ONESIGNAL_REST_API_KEY) {
      return NextResponse.json(
        { error: 'OneSignal REST API Key is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      data,
      include_external_user_ids,
      included_segments,
      // Appearance options
      small_icon,
      large_icon,
      big_picture,
      android_accent_color,
      ios_badge_type,
      ios_badge_count,
      ios_attachments,
      // Sound options
      android_sound,
      ios_sound,
      // Priority options
      priority,
      android_channel_id,
      ios_interruption_level,
      // Behavior options
      ttl,
      collapse_id,
      // URL options
      url,
      web_url,
      app_url,
      action_buttons,
      // Scheduling options
      send_after,
      delayed_option,
      delivery_time_of_day,
      // Grouping options
      android_group,
      thread_id,
      summary_arg,
      summary_arg_count,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Build OneSignal notification payload with defaults
    const notificationPayload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, tr: title },
      contents: { en: message, tr: message },
      data: data || {},

      // Apply defaults then override with provided values
      small_icon: small_icon || DEFAULT_NOTIFICATION_SETTINGS.small_icon,
      android_accent_color: android_accent_color || DEFAULT_NOTIFICATION_SETTINGS.android_accent_color,
      ios_badgeType: ios_badge_type || DEFAULT_NOTIFICATION_SETTINGS.ios_badge_type,
      ios_badgeCount: ios_badge_count ?? DEFAULT_NOTIFICATION_SETTINGS.ios_badge_count,
      priority: priority ?? DEFAULT_NOTIFICATION_SETTINGS.priority,
      ttl: ttl ?? DEFAULT_NOTIFICATION_SETTINGS.ttl,
    };

    // Optional appearance settings
    if (large_icon) {
      notificationPayload.large_icon = large_icon;
    }
    if (big_picture) {
      notificationPayload.big_picture = big_picture;
    }
    if (ios_attachments) {
      notificationPayload.ios_attachments = ios_attachments;
    }

    // Optional sound settings
    if (android_sound) {
      notificationPayload.android_sound = android_sound;
    }
    if (ios_sound) {
      notificationPayload.ios_sound = ios_sound;
    }

    // Optional priority settings
    if (android_channel_id) {
      notificationPayload.android_channel_id = android_channel_id;
    }
    if (ios_interruption_level) {
      notificationPayload.ios_interruption_level = ios_interruption_level;
    }

    // Optional behavior settings
    if (collapse_id) {
      notificationPayload.collapse_id = collapse_id;
    }

    // Optional URL settings
    if (url) {
      notificationPayload.url = url;
    }
    if (web_url) {
      notificationPayload.web_url = web_url;
    }
    if (app_url) {
      notificationPayload.app_url = app_url;
    }
    if (action_buttons && action_buttons.length > 0) {
      notificationPayload.buttons = action_buttons;
    }

    // Optional scheduling settings
    if (send_after) {
      notificationPayload.send_after = send_after;
    }
    if (delayed_option) {
      notificationPayload.delayed_option = delayed_option;
    }
    if (delivery_time_of_day) {
      notificationPayload.delivery_time_of_day = delivery_time_of_day;
    }

    // Optional grouping settings
    if (android_group) {
      notificationPayload.android_group = android_group;
    }
    if (thread_id) {
      notificationPayload.thread_id = thread_id;
    }
    if (summary_arg) {
      notificationPayload.summary_arg = summary_arg;
    }
    if (summary_arg_count) {
      notificationPayload.summary_arg_count = summary_arg_count;
    }

    // Target specific users or segments
    if (include_external_user_ids && include_external_user_ids.length > 0) {
      notificationPayload.include_aliases = {
        external_id: include_external_user_ids,
      };
      notificationPayload.target_channel = 'push';
    } else if (included_segments && included_segments.length > 0) {
      notificationPayload.included_segments = included_segments;
    } else {
      // Default: send to all subscribed users
      notificationPayload.included_segments = ['Subscribed Users'];
    }

    // Log payload for debugging
    console.log('OneSignal Request Payload:', JSON.stringify(notificationPayload, null, 2));

    // Send to OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const result = await response.json();

    // Log response for debugging
    console.log('OneSignal Response:', response.status, JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('OneSignal API error:', result);

      // Handle specific error cases
      const errorMessage = result.errors?.[0] || result.errors;

      // "All included players are not subscribed" means no users have push enabled
      if (errorMessage?.includes('not subscribed')) {
        return NextResponse.json({
          id: null,
          recipients: 0,
          warning: 'Push bildirim gonderildi ancak henuz abone olan kullanici yok. Kullanicilarin mobil uygulamada bildirim iznini acmasi gerekiyor.',
        });
      }

      return NextResponse.json(
        { error: errorMessage || 'Failed to send notification via OneSignal' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: result.id,
      recipients: result.recipients,
    });
  } catch (error) {
    console.error('Error in OneSignal send route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
