import { scheduleNotification } from '../services/notificationService'

/**
 * Course-registration reminder.
 *
 * McGill staggers registration start times per student, so the reminder card
 * cannot know when a given student's slot opens — they read it off Minerva and
 * enter it. We put it on their calendar and remind them the day before.
 *
 * Delegates to notificationService rather than calling the endpoint directly,
 * because that is where the notification PREFERENCES live: whether the student
 * has reminders on at all, which address to use, and whether they've opted out
 * of this event type. Posting straight to /api/notifications/schedule would
 * ignore all of it — and would also omit notify_email_addr, without which the
 * backend queues nothing and the event sits on the calendar silently never
 * reminding anyone.
 */

// Stable per student, so re-submitting a corrected time updates the same event.
export const REGISTRATION_EVENT_CLIENT_ID = 'course-registration-open'

export async function scheduleRegistrationReminder(
  userId, userEmail, date, time, notifPrefs = null,
) {
  return scheduleNotification(
    {
      clientId: REGISTRATION_EVENT_CLIENT_ID,
      title: 'Course registration opens',
      date,
      time: time || null,
      type: 'academic',
      category: 'deadlines',
      description:
        'Your Minerva registration start time. Fall and Winter open together — '
        + 'register for both terms in this session.',
      notifyEnabled: true,
      // The day before, as asked. Same-day is deliberately off: registration
      // slots are often early morning, so a same-day email can land after the
      // student's window has already opened.
      notify1Day: true,
      notifySameDay: false,
      notify7Days: false,
    },
    userId,
    userEmail,
    notifPrefs,
  )
}
