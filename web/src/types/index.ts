export type AuthResponse = {
  user_data: UserSchema;
  jwt: string;
};

export type SignUpRequest = {
  username: string;
  interests: string[];
  bday: number;
  pfp?: string;
};

export type SignUpValidateRequest = {
  username: string;
  bday: number;
};

export type LeafCommentsRequest = {
  last_leaf_comment_id: string;
  post_id: string;
};

export type RootCommentsRequest = {
  last_root_comment_id: string;
};

export type CommentUploadRequest = {
  root_id: string;
  content: string;
};

export type NotificationResponse = {
  notifier: string;
  type: string;
};

export type PostsRequest = {
  last_post_id?: string;
};

export type MessagesRequest = {
  chat_id: string;
  last_message_id?: string;
};

export type QrCodeResponse = {
  random_code: string;
  expire_time: number;
};

export type InterestsResponse = {
  interests: string[];
};

export type SuccessResponse = {
  success: boolean;
};

export type NumberResponse = {
  number: number;
};

export type UserSchema = {
  username: string;
  name: string;
  pfp: string;
  bday?: number;
  interests?: string[];
};

export type FriendshipRequest = {
  friend_code: string;
};

export type ContentFetch = {
  content:
    | PostResponse[]
    | RootCommentSchema[]
    | CommentSchema[]
    | MessageSchema[];
  last_doc_id: string;
};

export type RootCommentSchema = {
  comment: CommentSchema;
  leafs: number;
};

export type CommentSchema = {
  id: string;
  created_at: number;
  content: string;
  user_data: UserSchema;
};

export type PostResponse = {
  id: string;
  user_data: UserSchema;
  created_at: number;
  likes: number;
  comments: number;
  is_liked: boolean;
  content?: string;
  text?: string;
  type?: string;
};

export type PostRequest = {
  text_content?: string;
  type?: string;
  content?: string;
};

export type IdResponse = {
  id: string;
};

export type UserResponse = {
  personal: boolean;
  user_data: UserSchema;
  counters: {
    posts: number;
    friends: number;
    meteors: number;
  };
};

export type SupernovaResponse = {
  username: string;
  status: string;
  oneway: string;
};

export type UploadMessageRequest = {
  text_content: string;
  type: string;
  content: string;
};

export type SupernovaBind = {
  response: 'one-way-binding' | 'friendship-created' | 'blocked';
};

export type NewPersonalChatRequest = {
  receiver_username: string;
};

export type ChatsResponse = {
  chats: ChatSchema[];
};

export type ChatSchema = {
  chat_id: string;
  name: string;
  pfp: string;
  bday?: boolean;
  latest_message?: LatestMessageSchema;
  unreaded_messages?: number;
};

export type PersonalChatInfoResponse = {
  user_data: UserSchema;
};

export type MessageSchema = {
  id: string;
  personal: boolean;
  created_at: number;
  opened?: boolean;
  text?: string;
  content?: string;
  type?: string;
  pfp?: string;
  username?: string;
};

export type LatestMessageSchema = {
  content: string;
  type: string;
};
