import { zodResolver } from '@hookform/resolvers/zod'
import { formatISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useCreateOrUpdateDraftPoll,
  useCreatePoll,
  useDeletePoll,
  useGetDraftPoll,
} from '@/hooks/usePoll'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { combineDateTime, formatShortDate } from '@/utils/time'
import { pollSchema } from '@/validation/pollSchemas'

type DateTimeValues = {
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
}

export type PollFormData = z.infer<typeof pollSchema>

export function usePollForm() {
  const router = useRouter()
  const {
    mutate: createPollMutation,
    data: poll,
    isPending: isCreatingPoll,
    error: createPollError,
  } = useCreatePoll()

  const { data: draftPoll, isLoading: isLoadingDraft } = useGetDraftPoll()

  const { mutate: createOrUpdateDraftPoll, isPending: isSavingDraft } =
    useCreateOrUpdateDraftPoll()

  const { mutate: deletePoll, isPending: isDeletingPoll } = useDeletePoll()

  // Has form data been changed
  const [hasFormChanged, setHasFormChanged] = useState(false)

  // Date initialization
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const currentDay = new Date().getDate()

  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000) // 24 hours later

  // Form setup
  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      description: '',
      options: ['', ''],
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(), // Set to 24 hours after start
      tags: [],
      isAnonymous: false,
    },
    mode: 'onChange',
  })

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    getValues,
    trigger,
    setError,
    clearErrors,
    reset,
  } = form

  // Watch for changes to form values
  const watchedOptions = watch('options')
  const watchedTags = watch('tags')
  const watchedDescription = watch('description')
  const watchedValues = watch()
  const isAnonymous = watch('isAnonymous')

  // Form state
  const [tagInput, setTagInput] = useState('')
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [draftModalOpen, setDraftModalOpen] = useState(false)
  const [pollCreatedModalOpen, setPollCreatedModalOpen] = useState(false)
  const [hasDraftPoll, setHasDraftPoll] = useState(false)
  const [draftPollId, setDraftPollId] = useState<number | undefined>(undefined)

  const initialStartTime = new Date().toLocaleTimeString('en-EU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  // Date time state
  const [duration, setDuration] = useState<24 | 48 | 'custom'>(24)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState<DateTimeValues>({
    startDate: today,
    endDate: tomorrow,
    startTime: initialStartTime,
    endTime: '18:00',
  })
  const [customDateRange, setCustomDateRange] = useState<string | null>(null)
  const [customTimeRange, setCustomTimeRange] = useState<string | null>(null)

  // Timer ref for auto-saving
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Function to update the isAnonymous value
  const setIsAnonymous = (value: boolean) => {
    setValue('isAnonymous', value, { shouldDirty: true })
    setHasFormChanged(true)
  }

  // Load draft poll when the component mounts
  useEffect(() => {
    if (draftPoll && !isLoadingDraft) {
      setHasDraftPoll(true)
      setDraftPollId(draftPoll.pollId)

      // Set form values from the draft poll
      if (draftPoll.title) setValue('title', draftPoll.title)
      if (draftPoll.description) setValue('description', draftPoll.description)
      if (draftPoll.options && draftPoll.options.length > 0) {
        // Always ensure there are at least 2 options shown
        const options = [...draftPoll.options]

        // Add empty options if needed to meet the minimum of 2
        while (options.length < 2) {
          options.push('')
        }

        setValue('options', options)
      }
      if (draftPoll.tags && Array.isArray(draftPoll.tags)) {
        setValue('tags', draftPoll.tags)
      }
      if (draftPoll.isAnonymous !== undefined) {
        setValue('isAnonymous', draftPoll.isAnonymous)
        setIsAnonymous(draftPoll.isAnonymous)
      }

      // Handle startDate and endDate for duration display
      if (draftPoll.startDate && draftPoll.endDate) {
        setValue('startDate', draftPoll.startDate)
        setValue('endDate', draftPoll.endDate)

        const startDate = new Date(draftPoll.startDate)
        const endDate = new Date(draftPoll.endDate)

        // Calculate the difference in hours
        const diffInHours =
          Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

        // Set duration based on the difference
        if (Math.abs(diffInHours - 24) < 1) {
          setDuration(24)
        } else if (Math.abs(diffInHours - 48) < 1) {
          setDuration(48)
        } else {
          setDuration('custom')

          // Format and set the custom date range
          const startDateStr = formatShortDate(startDate)
          const endDateStr = formatShortDate(endDate)
          setCustomDateRange(`${startDateStr} to ${endDateStr}`)

          // Format and set the custom time range
          const startTimeStr = startDate.toLocaleTimeString('en-EU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          const endTimeStr = endDate.toLocaleTimeString('en-EU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          setCustomTimeRange(`${startTimeStr} to ${endTimeStr}`)

          // Update the selectedDateTime state
          setSelectedDateTime({
            startDate,
            endDate,
            startTime: startTimeStr,
            endTime: endTimeStr,
          })
        }
      }

      // Reset form change state after loading draft
      setHasFormChanged(false)
    }
  }, [draftPoll, isLoadingDraft, setValue])

  // Check for form changes that would trigger draft saving
  useEffect(() => {
    if (isDirty) {
      setHasFormChanged(true)
    }
  }, [watchedValues, isDirty])

  // Autosave form changes after 20 seconds of inactivity
  useEffect(() => {
    if (hasFormChanged) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set a new timer
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraftPoll()
      }, 20000) // 20 seconds
    }

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [watchedValues, hasFormChanged])

  // Add event listener for beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasFormChanged) {
        // Auto-save before unloading
        saveDraftPoll()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasFormChanged])

  // Add event listener for browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Show the draft modal if there are unsaved changes
      if (hasFormChanged) {
        setDraftModalOpen(true)
        // Push a new state to prevent immediate navigation
        window.history.pushState(null, '', window.location.pathname)
      }
    }

    // Push a state when the component mounts to ensure popstate will fire
    window.history.pushState(null, '', window.location.pathname)

    // Add the event listener
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasFormChanged, setDraftModalOpen])

  // Function to intercept the back navigation
  const handleBackNavigation = () => {
    sendHapticFeedbackCommand()
    if (hasFormChanged) {
      // Show the draft modal
      setDraftModalOpen(true)
      return
    }
    // Just navigate back if no changes
    router.push('/')
  }

  // Function to save the draft poll
  const saveDraftPoll = () => {
    const currentValues = getValues()

    const draftData = {
      ...(draftPollId ? { pollId: draftPollId } : {}),
      title: currentValues.title || undefined,
      description: currentValues.description || undefined,
      options:
        currentValues.options.filter(opt => opt.trim() !== '') || undefined,
      tags: currentValues.tags || undefined,
      isAnonymous: currentValues.isAnonymous,
      startDate: currentValues.startDate || undefined,
      endDate: currentValues.endDate || undefined,
    }

    // Don't save if there's no meaningful data
    const hasData =
      draftData.title ||
      draftData.description ||
      (draftData.options && draftData.options.length > 0) ||
      (draftData.tags && draftData.tags.length > 0) ||
      draftData.isAnonymous

    if (hasData) {
      if (draftModalOpen) {
        createOrUpdateDraftPoll(draftData, {
          onSuccess: () => {
            router.push('/')
          },
        })
      } else {
        createOrUpdateDraftPoll(draftData)
      }
    } else if (draftModalOpen) {
      router.push('/')
    }
  }

  // Function to delete the draft poll
  const deleteDraftPoll = () => {
    reset()
    if (draftPollId) {
      deletePoll(
        { id: draftPollId },
        {
          onSuccess: () => {
            setHasDraftPoll(false)
            setDraftPollId(undefined)
            // Only navigate back after successful deletion
            router.push('/')
          },
        },
      )
    } else {
      router.push('/')
    }
  }

  // Check for API errors
  useEffect(() => {
    if (createPollError) {
      setGeneralError('Failed to create poll. Please try again.')
    }
  }, [createPollError])

  // Display success modal when poll is created
  useEffect(() => {
    if (poll && !isCreatingPoll) {
      setPollCreatedModalOpen(true)
      // Clear form
      reset()
      // If we had a draft, it's now published so we can clear it
      if (hasDraftPoll && draftPollId) {
        deletePoll({ id: draftPollId })
        setHasDraftPoll(false)
        setDraftPollId(undefined)
      }
    }
  }, [poll, isCreatingPoll])

  // Options handlers
  const addOption = () => {
    sendHapticFeedbackCommand()
    setValue('options', [...watchedOptions, ''])
  }

  const removeOption = (index: number) => {
    sendHapticFeedbackCommand()
    if (watchedOptions.length > 2) {
      const newOptions = watchedOptions.filter((_, i) => i !== index)
      setValue('options', newOptions, { shouldDirty: true })
      // Ensure form is marked as changed
      setHasFormChanged(true)
    }
  }

  // Tags handlers
  const addTag = (tag: string) => {
    // Handle case where multiple tags are entered with commas, spaces, or new lines
    const allTags = tag
      .split(/[,\s\n]/) // Split on commas, whitespace, or newlines
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== '') // Filter out empty strings, but keep all potential tags

    if (allTags.length === 0) return

    // Check if any of the tags are too short
    const shortTags = allTags.filter(t => t.length > 0 && t.length < 3)
    if (shortTags.length > 0) {
      setError('tags', {
        message: `Tag${shortTags.length > 1 ? 's' : ''} "${shortTags.join(
          ', ',
        )}" must be at least 3 characters`,
      })
      setTagInput('') // Clear input after showing error
      return
    }

    // All tags are valid, proceed to add them
    const validTags = allTags.filter(t => t.length >= 3)
    const newTags = [...watchedTags]

    for (const tagToAdd of validTags) {
      if (
        tagToAdd &&
        !newTags.includes(tagToAdd) &&
        newTags.length < 5 &&
        tagToAdd.length <= 20 // Only add tags that don't exceed max length
      ) {
        newTags.push(tagToAdd)
      }

      // Stop adding tags once we reach the limit
      if (newTags.length >= 5) break
    }

    if (newTags.length !== watchedTags.length) {
      setValue('tags', newTags, { shouldDirty: true })
      setTagInput('')
      trigger('tags')
      // Ensure form is marked as changed
      setHasFormChanged(true)
    } else {
      setTagInput('') // Clear the input even if no tags were added
    }
  }

  const removeTag = (tag: string) => {
    const newTags = watchedTags.filter(t => t !== tag)
    setValue('tags', newTags, { shouldDirty: true })
    // Ensure form is marked as changed
    setHasFormChanged(true)
    trigger('tags')
  }

  const handleDateTimeApply = (values: DateTimeValues) => {
    setDuration('custom')

    setSelectedDateTime(values)

    setCustomDateRange(
      `${formatShortDate(values.startDate)} to ${formatShortDate(
        values.endDate,
      )}`,
    )
    setCustomTimeRange(`${values.startTime} to ${values.endTime}`)

    // Format dates for API
    if (values.startDate && values.startTime) {
      const startDateTime = combineDateTime(values.startDate, values.startTime)
      setValue('startDate', startDateTime.toISOString(), {
        shouldDirty: true,
      })
    }

    if (values.endDate && values.endTime) {
      const endDateTime = combineDateTime(values.endDate, values.endTime)
      setValue('endDate', endDateTime.toISOString(), {
        shouldDirty: true,
      })
    }

    // Set form as changed explicitly
    setHasFormChanged(true)
  }

  const setDateRange = (
    duration: 24 | 48 | 'custom',
    startDate: Date,
    endDate: Date,
  ) => {
    const now = new Date()
    let end: Date
    const start = now

    if (duration === 24) {
      end = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    } else if (duration === 48) {
      end = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    } else {
      if (startDate === endDate) {
        setGeneralError('Start date and end date cannot be the same')
        return { formattedStartDate: '', formattedEndDate: '' }
      }

      end = endDate
    }

    return {
      formattedStartDate: formatISO(start),
      formattedEndDate: formatISO(end),
    }
  }

  const onSubmit = (data: PollFormData) => {
    setGeneralError(null)

    const cleanedOptions = data.options.filter(option => option.trim() !== '')

    if (cleanedOptions.length < 2) {
      setGeneralError('At least 2 non-empty options are required')
      return
    }

    const { formattedStartDate, formattedEndDate } = setDateRange(
      duration,
      new Date(data.startDate),
      new Date(data.endDate),
    )

    if (!formattedStartDate || !formattedEndDate) return

    createPollMutation({
      ...data,
      options: cleanedOptions,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    })
  }

  const handlePublish = () => {
    sendHapticFeedbackCommand()
    trigger().then(isValid => {
      if (isValid) {
        handleSubmit(onSubmit)()
      }
    })
  }

  useEffect(() => {
    if (tagInput.length > 20) {
      setError('tags', {
        message: `${tagInput.length}/20 Max tag character limit reached`,
      })
    } else if (tagInput.length < 3 && tagInput.length > 0) {
      setError('tags', {
        message: 'Must be at least 3 characters',
      })
    } else {
      clearErrors('tags')
    }
  }, [tagInput])

  // Function to update duration and form values
  const updateDuration = (newDuration: 24 | 48 | 'custom') => {
    setDuration(newDuration)

    // Only update dates for preset durations
    if (newDuration === 24 || newDuration === 48) {
      const now = new Date()
      const end = new Date(now.getTime() + newDuration * 60 * 60 * 1000)

      setValue('startDate', now.toISOString(), { shouldDirty: true })
      setValue('endDate', end.toISOString(), { shouldDirty: true })

      // Set form as changed explicitly
      setHasFormChanged(true)
    }
  }

  return {
    form,
    register,
    errors,
    watchedOptions,
    watchedTags,
    watchedDescription,
    tagInput,
    setTagInput,
    generalError,
    draftModalOpen,
    setDraftModalOpen,
    pollCreatedModalOpen,
    setPollCreatedModalOpen,
    datePickerOpen,
    setDatePickerOpen,
    duration,
    setDuration: updateDuration,
    selectedDateTime,
    customDateRange,
    customTimeRange,
    isCreatingPoll,
    createPollError,
    poll,
    getValues,
    addOption,
    removeOption,
    addTag,
    removeTag,
    handleDateTimeApply,
    handlePublish,
    handleBackNavigation,
    saveDraftPoll,
    deleteDraftPoll,
    hasFormChanged,
    isLoadingDraft,
    isAnonymous,
    setIsAnonymous,
  }
}
