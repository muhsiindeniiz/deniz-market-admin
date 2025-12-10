import { NextRequest, NextResponse } from 'next/server';
import { ONESIGNAL_APP_ID } from '@/lib/onesignal';

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
    const { notification_id } = body;

    if (!notification_id) {
      return NextResponse.json(
        { error: 'notification_id is required' },
        { status: 400 }
      );
    }

    // Cancel/Delete notification from OneSignal
    const response = await fetch(
      `https://onesignal.com/api/v1/notifications/${notification_id}?app_id=${ONESIGNAL_APP_ID}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
      }
    );

    // OneSignal returns 200 on success, but may return errors for already delivered notifications
    if (!response.ok) {
      const result = await response.json();
      console.error('OneSignal cancel error:', result);

      // If notification was already delivered or doesn't exist, we still consider it a success
      // because the goal is to prevent future delivery
      if (response.status === 404 || result.errors?.includes('Notification has already been sent')) {
        return NextResponse.json({
          success: true,
          message: 'Notification already delivered or not found',
        });
      }

      return NextResponse.json(
        { error: result.errors?.[0] || 'Failed to cancel notification' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification cancelled successfully',
    });
  } catch (error) {
    console.error('Error in OneSignal cancel route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
