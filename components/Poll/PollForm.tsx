'use client'

import { useEffect, type KeyboardEvent } from 'react'
import { usePollForm } from '@/hooks/usePollForm'
import { cn } from '@/utils'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import DateTimePicker from '../DateTimePicker/DateTimePicker'
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon2,
  CloseIcon,
  PlusIcon,
  XOutlinedIcon,
} from '../icon-components'
import DraftPollModal from '../Modals/DraftPollModal'
import PollCreatedModal from '../Modals/PollCreatedModal'
import { Button } from '../ui/Button'
import Switch from '../ui/Switch'

export default function PollForm({
  usePollFormData,
}: {
  usePollFormData: ReturnType<typeof usePollForm>
}) {
  const {
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
    datePickerOpen,
    setDatePickerOpen,
    selectedDateTime,
    customDateRange,
    customTimeRange,
    isCreatingPoll,
    createPollError,
    poll,
    duration,
    getValues,
    form,
    addOption,
    removeOption,
    addTag,
    removeTag,
    setDuration,
    handleDateTimeApply,
    handlePublish,
    saveDraftPoll,
    deleteDraftPoll,
    isAnonymous,
    setIsAnonymous,
  } = usePollFormData

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      saveDraftPoll()
    }
  }, [])

  const BASE_INPUT_CLASSES =
    'flex h-12 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50'

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // If the user typed a space or comma, we should process the tag
    if (value.endsWith(' ') || value.endsWith(',')) {
      // Process everything before the last character as a potential tag
      const tagValue = value.slice(0, -1)
      if (tagValue.trim()) {
        addTag(tagValue)
      }
      return
    }

    // Otherwise, just update the input value
    setTagInput(value)
  }

  // Handle blur event to apply tag when focus changes
  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput)
    }
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      // Process tag when Enter, space, or comma is pressed
      if (tagInput.trim()) {
        addTag(tagInput)
      }
    } else if (
      e.key === 'Backspace' &&
      tagInput === '' &&
      watchedTags.length > 0
    ) {
      const lastTag = watchedTags[watchedTags.length - 1]
      removeTag(lastTag)
    }
  }

  // Handle paste event to immediately process tags
  const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    // Handle paste regardless of content - the addTag function will handle validation
    e.preventDefault()
    addTag(tagInput + pastedText)
  }

  const renderErrorMessage = (message: string) => (
    <div className="text-error-700 text-sm mt-1 flex items-center justify-end gap-1 error-message">
      <span>{message}</span>
    </div>
  )

  const renderTagsInput = () => (
    <div className="border border-gray-200 rounded-lg p-2 flex flex-wrap items-center gap-2">
      {watchedTags.map((tag, index) => (
        <div
          key={index}
          className="flex items-center gap-1 bg-white border border-gray-300 px-1 py-0.5 text-sm rounded-md"
        >
          <span className="text-gray-900">{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="focus:outline-none"
          >
            <CloseIcon size={16} color="#9BA3AE" />
          </button>
        </div>
      ))}
      <input
        value={tagInput}
        onChange={handleTagChange}
        onKeyDown={handleTagKeyDown}
        onPaste={handleTagPaste}
        onBlur={handleTagBlur}
        placeholder={watchedTags.length === 0 ? 'Add tags' : ''}
        className="border-none flex-1 min-w-[100px] p-2 text-gray-900 focus:outline-none"
        disabled={watchedTags.length >= 5}
      />
    </div>
  )

  const renderPollOptions = () => (
    <div className="space-y-3 mb-6">
      {watchedOptions.map((option, index) => (
        <div key={index} className="flex flex-col">
          <div className="flex items-center gap-2">
            <input
              {...register(`options.${index}`)}
              placeholder={`Option ${index + 1}`}
              className={cn(
                BASE_INPUT_CLASSES,
                errors.options?.[index]
                  ? 'border-error-700 focus:ring-error-700 focus:border-error-700'
                  : '',
              )}
            />
            {watchedOptions.length > 2 &&
              index === watchedOptions.length - 1 && (
                <button type="button" onClick={() => removeOption(index)}>
                  <XOutlinedIcon />
                </button>
              )}
          </div>
          {errors.options?.[index] &&
            renderErrorMessage(errors.options[index]?.message as string)}
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        disabled={watchedOptions.length >= 20}
        className="flex items-center gap-2 bg-gray-200 text-gray-900 px-4 py-2 text-sm rounded-lg disabled:opacity-25 disabled:cursor-not-allowed"
      >
        <PlusIcon size={16} color="#191C20" />
        Add option
      </button>

      {errors.options &&
        !Array.isArray(errors.options) &&
        renderErrorMessage(errors.options.message as string)}
      {watchedOptions.length >= 20 && (
        <p className="flex items-center justify-end text-gray-500 text-sm mt-1">
          Maximum of 20 options reached
        </p>
      )}
    </div>
  )

  const renderDurationSelector = () => (
    <div className="space-y-4">
      <DurationOption
        label="24 hours"
        selected={duration === 24}
        onClick={() => setDuration(24)}
      />
      <DurationOption
        label="48 hours"
        selected={duration === 48}
        onClick={() => setDuration(48)}
      />
      <div className="flex items-center justify-between">
        <span className="text-gray-900">Custom</span>
        {duration === 'custom' ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              sendHapticFeedbackCommand()
              setDatePickerOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-2"
          >
            <div>
              <div className="text-sm font-medium text-gray-900">
                {customDateRange}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                {customTimeRange}
              </div>
            </div>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              sendHapticFeedbackCommand()
              setDatePickerOpen(true)
            }}
            className="flex items-center gap-2 p-2 px-3 font-normal text-sm"
          >
            <CalendarIcon />
            Select Date & Time
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(data => {})}>
      <div className="flex-1 bg-white rounded-t-3xl p-4 flex flex-col">
        <div className="space-y-4 mb-6">
          <div>
            <input
              {...register('title')}
              placeholder="Enter poll question"
              className={cn(
                BASE_INPUT_CLASSES,
                errors.title
                  ? 'border-error-700 focus:ring-error-700 focus:border-error-700'
                  : '',
              )}
            />
            {errors.title && renderErrorMessage(errors.title.message as string)}
          </div>

          <div>
            <textarea
              {...register('description')}
              placeholder="Enter description"
              className={cn(
                BASE_INPUT_CLASSES,
                'min-h-[120px] p-4 text-gray-900',
                errors.description
                  ? 'border-error-700 focus:ring-error-700 focus:border-error-700'
                  : '',
              )}
            />
            {errors.description
              ? renderErrorMessage(errors.description.message as string)
              : watchedDescription.length <= 1400 && (
                  <p className="flex items-center justify-end gap-1 text-gray-500 text-sm mt-1">
                    {watchedDescription.length}/1400
                  </p>
                )}
          </div>

          <div>
            {renderTagsInput()}
            {watchedTags.length === 5 ? (
              <p className="flex items-center justify-end gap-1 text-gray-500 text-sm mt-1">
                5/5 Tags added
              </p>
            ) : (
              errors.tags &&
              !Array.isArray(errors.tags) &&
              renderErrorMessage(errors.tags.message as string)
            )}
          </div>
        </div>

        {renderPollOptions()}

        <div className="border-t border-gray-200 my-4"></div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Poll Type</h2>

          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">Anonymous Poll</span>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Prevent anyone from seeing how others voted.
          </p>

          <h2 className="text-lg font-medium mb-4 text-gray-900">
            Poll Duration
          </h2>
          {renderDurationSelector()}
          {(errors.startDate || errors.endDate) &&
            renderErrorMessage('Valid start and end dates are required')}
        </div>

        {(generalError || createPollError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {generalError || 'An error occurred. Please try again.'}
          </div>
        )}

        <Button
          type="button"
          className="w-full mt-auto py-4 active:scale-95 active:transition-transform active:duration-100"
          onClick={handlePublish}
          disabled={isCreatingPoll}
        >
          {isCreatingPoll ? 'Publishing...' : 'Publish Poll'}
        </Button>
      </div>

      <DateTimePicker
        open={datePickerOpen}
        onOpenChange={setDatePickerOpen}
        onApply={handleDateTimeApply}
        initialStartDate={selectedDateTime.startDate}
        initialEndDate={selectedDateTime.endDate}
        initialStartTime={selectedDateTime.startTime}
        initialEndTime={selectedDateTime.endTime}
      />

      <PollCreatedModal
        open={pollCreatedModalOpen}
        pollTitle={getValues('title')}
        pollId={poll?.pollId}
      />

      <DraftPollModal
        modalOpen={draftModalOpen}
        setModalOpen={setDraftModalOpen}
        onSaveAsDraft={saveDraftPoll}
        onDelete={deleteDraftPoll}
      />
    </form>
  )
}

function DurationOption({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ClockIcon2 />
        <span className="text-gray-900">{label}</span>
      </div>
      <div
        className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
          selected ? 'bg-gray-900' : 'border border-gray-300'
        }`}
        onClick={onClick}
        onTouchStart={() =>
          sendHapticFeedbackCommand({ type: 'selectionChanged' })
        }
      >
        {selected && <CheckIcon />}
      </div>
    </div>
  )
}
