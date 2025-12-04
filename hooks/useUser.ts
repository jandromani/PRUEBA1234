import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

interface IUser {
  id: string
  username: string
  isAdmin: boolean
  tournamentsHosted: number
  tournamentsJoined: number
  worldID: string
  worldProfilePic?: string
  name?: string
  email: string
  createdAt: string
  updatedAt: string
}

export const useUserData = (
  worldId?: string | null,
): UseQueryResult<IUser, Error> => {
  const { worldID: authWorldId } = useAuth()
  const effectiveWorldId = worldId || authWorldId

  return useQuery({
    queryKey: ['user', 'data', effectiveWorldId],
    queryFn: async () => {
      try {
        const res = await fetch(`/user/getUserData?worldID=${effectiveWorldId}`)
        if (!res.ok) throw new Error('Failed to fetch user data')
        return await res.json()
      } catch (error) {
        console.error('Error fetching user data:', error)
        throw error
      }
    },
    enabled: !!effectiveWorldId,
  })
}
