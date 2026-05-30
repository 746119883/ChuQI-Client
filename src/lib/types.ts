export type Role = 'admin' | 'member' | 'elder'

export interface Profile {
  nickname: string
  avatar_url: string | null
  display_name: string
  relation: string
  role: Role
  birthday: string | null
  birthday_is_lunar: boolean
}

export interface User {
  id: number
  username: string
  display_name: string
  avatar_url: string | null
  profile?: Profile
}

export interface Member extends User {
  is_active: boolean
  is_superuser: boolean
  date_joined: string
}

export type InvitationStatus = 'active' | 'used' | 'revoked' | 'expired'

export interface Invitation {
  id: number
  code: string
  role: Role
  role_display: string
  default_nickname: string
  note: string
  created_by: User
  created_at: string
  expires_at: string
  used_by: User | null
  used_at: string | null
  revoked: boolean
  status: InvitationStatus
}

export interface InvitationLookup {
  code: string
  role: Role
  role_display: string
  default_nickname: string
  note: string
  invited_by: string
}

export interface Note {
  id: number
  title: string
  content: string
  author: User
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ImageSource = 'local' | 'immich'

export interface MomentImage {
  id: number
  order: number
  source: ImageSource
  immich_asset_id: string
  thumbnail_url: string
  preview_url: string
  original_url: string
}

export interface ImmichAsset {
  id: string
  type: 'IMAGE' | 'VIDEO'
  original_file_name: string
  file_created_at: string
  local_date_time: string
  width: number | null
  height: number | null
  duration: string
  thumbhash: string | null
  thumbnail_url: string
  preview_url: string
}

export interface ImmichRecent {
  total: number
  count: number
  next_page: string | null
  items: ImmichAsset[]
}

export interface ImmichAlbum {
  id: string
  name: string
  description: string
  asset_count: number
  shared: boolean
  updated_at: string | null
  start_date: string | null
  end_date: string | null
  thumbnail_url: string | null
}

export interface ImmichAlbumList {
  count: number
  items: ImmichAlbum[]
}

export interface ImmichAlbumAssets {
  id: string
  name: string
  count: number
  items: ImmichAsset[]
}

export interface ImmichToday {
  enabled: boolean
  total: number
  items: ImmichAsset[]
  error?: string
}

export interface ImmichStatus {
  enabled: boolean
  url: string | null
}

export type Visibility = 'family' | 'private'

export type ReactionKey = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'celebrate'

export interface ReactionSummaryItem {
  emoji: ReactionKey
  char: string
  count: number
  mine: boolean
}

export interface Moment {
  id: number
  author: User
  content: string
  visibility: Visibility
  images: MomentImage[]
  reactions_count: number
  reactions_summary: ReactionSummaryItem[]
  my_reaction: ReactionKey | null
  comments_count: number
  liked_by_me: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  author: User
  content: string
  created_at: string
}

export interface Album {
  id: number
  name: string
  description: string
  owner: User
  cover_thumbnail: string | null
  photo_count: number
  video_count: number
  created_at: string
  updated_at: string
}

export interface Photo {
  type: 'photo'
  id: number
  uploader: User
  album: number | null
  image: string
  thumbnail: string
  width: number
  height: number
  size_bytes: number
  caption: string
  taken_at: string | null
  uploaded_at: string
}

export interface Video {
  type: 'video'
  id: number
  uploader: User
  album: number | null
  file: string
  poster: string
  width: number
  height: number
  duration: number
  size_bytes: number
  caption: string
  taken_at: string | null
  uploaded_at: string
}

export type MediaItem = Photo | Video

export interface TaskList {
  id: number
  name: string
  description: string
  is_shared: boolean
  owner: User
  total: number
  done: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  list: number
  title: string
  completed: boolean
  completed_at: string | null
  completed_by: User | null
  created_by: User | null
  created_at: string
  updated_at: string
}

export type EventType = 'general' | 'birthday' | 'anniversary' | 'memorial' | 'holiday'

export interface CalendarEvent {
  id: number | string
  owner: User
  title: string
  description: string
  event_type: EventType
  color: string
  visibility: Visibility
  is_lunar: boolean
  date_year: number | null
  date_month: number
  date_day: number
  all_day: boolean
  start_time: string | null
  end_time: string | null
  yearly_recurring: boolean
  remind_days_before: number | null
  created_at: string | null
  updated_at: string | null
  is_profile_birthday?: boolean
}

export interface EventOccurrence {
  date: string         // YYYY-MM-DD 公历
  lunar_label: string  // 例如 "五月初一"
  event: CalendarEvent
}

export type TripStatus = 'planning' | 'ongoing' | 'done'
export type TripItemType =
  | 'transport' | 'hotel' | 'activity' | 'food' | 'ticket' | 'info' | 'other'

export interface TripItem {
  id: number
  trip: number
  date: string
  time: string | null
  item_type: TripItemType
  type_display: string
  title: string
  detail: string
  location: string
  order: number
  created_at: string
}

export type ChecklistKind = 'bring' | 'buy'

export interface TripChecklistItem {
  id: number
  trip: number
  kind: ChecklistKind
  kind_display: string
  text: string
  checked: boolean
  created_by: User | null
  order: number
  created_at: string
}

export interface Trip {
  id: number
  owner: User
  title: string
  destination: string
  start_date: string
  end_date: string | null
  summary: string
  cover_url: string | null
  cover_immich_asset_id: string
  immich_album_id: string
  visibility: Visibility
  status: TripStatus
  item_count: number
  items: TripItem[]
  checklist: TripChecklistItem[]
  created_at: string
  updated_at: string
}

export interface TripListItem {
  id: number
  owner: User
  title: string
  destination: string
  start_date: string
  end_date: string | null
  cover_url: string | null
  visibility: Visibility
  status: TripStatus
  item_count: number
  created_at: string
  updated_at: string
}

export type LedgerType = 'expense' | 'income'
export type LedgerCategory =
  | 'food' | 'shopping' | 'appliance' | 'travel' | 'medical'
  | 'education' | 'social' | 'housing' | 'transport'
  | 'salary' | 'bonus' | 'other'

export interface LedgerEntry {
  id: number
  recorder: User
  entry_type: LedgerType
  type_display: string
  amount: string
  category: LedgerCategory
  category_display: string
  title: string
  note: string
  date: string
  visibility: Visibility
  created_at: string
  updated_at: string
}

export interface LedgerMonthly {
  month: number
  expense: string
  income: string
}

export interface LedgerCategoryTotal {
  category: LedgerCategory
  category_display: string
  total: string
}

export interface LedgerSummary {
  year: number
  monthly: LedgerMonthly[]
  by_category: LedgerCategoryTotal[]
  total_expense: string
  total_income: string
}

export type RecipeCategory =
  | 'meat' | 'veg' | 'soup' | 'staple'
  | 'breakfast' | 'dessert' | 'drink' | 'other'
export type RecipeDifficulty = 'easy' | 'medium' | 'hard'

export interface Ingredient {
  name: string
  amount: string
}

export interface RecipeStep {
  text: string
}

export interface Recipe {
  id: number
  author: User
  title: string
  description: string
  category: RecipeCategory
  category_display: string
  tags: string[]
  servings: string
  total_time_min: number | null
  difficulty: RecipeDifficulty
  difficulty_display: string
  ingredients: Ingredient[]
  steps: RecipeStep[]
  cover_url: string | null
  cover_immich_asset_id: string
  visibility: Visibility
  created_at: string
  updated_at: string
}

export interface RecipeListItem {
  id: number
  author: User
  title: string
  category: RecipeCategory
  category_display: string
  tags: string[]
  servings: string
  total_time_min: number | null
  difficulty: RecipeDifficulty
  cover_url: string | null
  ingredient_count: number
  visibility: Visibility
  created_at: string
  updated_at: string
}

export interface VaultFolderBrief {
  id: number
  name: string
}

export interface VaultFolder {
  id: number
  name: string
  parent: number | null
  visibility: Visibility
  description: string
  owner: User
  item_count: number
  ancestors: VaultFolderBrief[]
  created_at: string
  updated_at: string
}

export interface VaultFile {
  id: number
  uploader: User
  folder: number | null
  file: string
  name: string
  size_bytes: number
  mime_type: string
  is_important: boolean
  visibility: Visibility
  description: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

// ---- 通知 ----
export type NotificationVerb = 'comment' | 'mention' | 'reaction' | 'birthday' | 'event' | 'expiry'

export interface Notification {
  id: number
  actor: User | null
  verb: NotificationVerb
  verb_display: string
  moment: number | null
  comment: number | null
  emoji: string
  text: string
  moment_preview: string
  is_read: boolean
  created_at: string
}

// ---- 家庭大事记 / 时间轴 ----
export type MilestoneType =
  | 'birth' | 'marriage' | 'home' | 'graduation'
  | 'career' | 'travel' | 'pet' | 'honor' | 'other'

export interface Milestone {
  id: number
  created_by: User
  title: string
  date: string
  milestone_type: MilestoneType
  type_display: string
  icon: string
  description: string
  cover_url: string | null
  cover_immich_asset_id: string
  visibility: Visibility
  created_at: string
  updated_at: string
}

export interface TimelineEntry {
  kind: 'milestone' | 'trip'
  id: number
  date: string
  end_date: string | null
  title: string
  subtitle: string
  milestone_type: MilestoneType | null
  icon: string
  cover_url: string | null
  description: string
}

// ---- 去年的今天 ----
export interface OnThisDayTrip {
  id: number
  title: string
  destination: string
  cover_url: string | null
}

export interface OnThisDayGroup {
  year: number
  years_ago: number
  moments: Moment[]
  trips: OnThisDayTrip[]
  photos: ImmichAsset[]
}

export interface OnThisDayResponse {
  today: string
  groups: OnThisDayGroup[]
}

// ---- 吃什么 (meals) ----
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type OptionKind = 'home' | 'takeout' | 'dineout'

export interface DiningOption {
  id: number
  created_by: User
  name: string
  kind: OptionKind
  kind_display: string
  note: string
  weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MealLog {
  id: number
  recorder: User
  date: string
  meal_type: MealType
  meal_type_display: string
  recipe: number | null
  option: number | null
  custom_name: string
  display_name: string
  cover_url: string | null
  note: string
  created_at: string
}

export interface RollCandidate {
  type: 'recipe' | 'option'
  id: number
  name: string
  kind: OptionKind | null
  kind_display: string | null
  cover_url: string | null
}

export interface RollResult {
  main: RollCandidate | null
  alternatives: RollCandidate[]
  pool_size: number
}

// ---- 家庭故事 ----
export type StoryBlockKind = 'text' | 'photo' | 'immich'

export interface StoryBlock {
  id: number
  kind: StoryBlockKind
  order: number
  text: string
  image_url: string | null
  immich_asset_id: string
  immich_filename: string
  immich_thumbnail_url: string | null
  immich_preview_url: string | null
  caption: string
}

export interface Story {
  id: number
  author: User
  title: string
  date: string
  summary: string
  cover_url: string | null
  cover_immich_asset_id: string
  visibility: Visibility
  blocks: StoryBlock[]
  created_at: string
  updated_at: string
}

export interface StoryListItem {
  id: number
  author: User
  title: string
  date: string
  summary: string
  cover_url: string | null
  block_count: number
  visibility: Visibility
  created_at: string
  updated_at: string
}
