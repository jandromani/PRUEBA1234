export interface IPoll {
  authorUserId: number
  author: IAuthor
  hasVoted: boolean
  creationDate: string
  description: string
  endDate: string
  isAnonymous: boolean
  options: string[]
  participantCount: number
  pollId: number
  startDate: string
  tags: string[]
  title: string
  voteResults: IVoteResult[]
}

export interface IPollDetails {
  poll: IPoll & { author: IAuthor }
  isActive: boolean
  optionsTotalVotes: Record<string, number>
  totalVotes: number
}

export interface IVoteResult {
  optionId: number
  voteCount: number
}

export interface IPollFilters {
  livePolls: boolean
  finishedPolls: boolean
  pollsVoted: boolean
  pollsCreated: boolean
}

export interface IAuthor {
  id: number
  name: string
  pollsCreatedCount: number
  pollsParticipatedCount: number
  profilePicture: string
  worldID: string
}

export enum FilterParams {
  All = 'all',
  Trending = 'trending',
  Recent = 'recent',
  Voted = 'voted',
}

export enum ActionType {
  CREATED = 'CREATED',
  VOTED = 'VOTED',
}

export interface UserActionDto {
  id: number
  type: ActionType
  pollId: number
  pollTitle: string
  pollDescription: string
  isAnonymous: boolean
  startDate: string
  endDate: string
  isActive: boolean
  votersParticipated: number
  authorWorldId: string
  authorName: string
  authorProfilePicture: string
  createdAt: string
  hasVoted: boolean
}

export enum PollSortBy {
  CREATION_DATE = 'creationDate',
  END_DATE = 'endDate',
  PARTICIPANT_COUNT = 'participantCount',
  CLOSEST_END_DATE = 'closestEndDate',
}
