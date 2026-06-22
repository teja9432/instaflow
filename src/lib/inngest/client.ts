import { Inngest, EventSchemas } from 'inngest';

export type CommentReceivedEvent = {
  name: 'instagram/comment.received';
  data: {
    instagramAccountId: string;
    commentId: string;
    commentText: string;
    commenterUsername: string;
    commenterId: string;
    postId: string;
  };
};

type Events = {
  'instagram/comment.received': CommentReceivedEvent;
};

export const inngest = new Inngest({
  id: 'instagram-automation-saas',
  schemas: new EventSchemas().fromRecord<Events>(),
});
