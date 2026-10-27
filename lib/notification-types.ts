export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string | null;
  read: boolean;
  created_at: string;
};
