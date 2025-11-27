import { IPoll, UserActionDto } from '@/types/poll'

// Transform UserActionDto to match IPoll structure for PollCard
export const transformActionToPoll = (action: UserActionDto): IPoll => {
  return {
    pollId: action.pollId,
    title: action.pollTitle,
    description: action.pollDescription,
    endDate: action.endDate,
    startDate: action.startDate,
    creationDate: action.createdAt,
    participantCount: action.votersParticipated,
    hasVoted: action.hasVoted,
    authorUserId: 0, // Not available from the API
    author: {
      id: 0, // Not available from the API
      name: action.authorName,
      profilePicture: action.authorProfilePicture,
      pollsCreatedCount: 0, // Not available from the API
      pollsParticipatedCount: 0, // Not available from the API
      worldID: action.authorWorldId,
    },
    isAnonymous: action.isAnonymous,
    options: [], // Not available from the API
    tags: [], // Not available from the API
    voteResults: [], // Not available from the API
  }
}
