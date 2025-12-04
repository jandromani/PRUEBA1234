import crypto from 'crypto'
import {
  TournamentEvent,
  TournamentQuestion,
  TournamentResponse,
  ResponsePayload,
  FraudFlag,
  TournamentRoomStatus,
} from '@/types/tournament'

type Listener = (event: TournamentEvent) => void

interface ActiveQuestion extends TournamentQuestion {
  deadline: string
  openedAt: string
}

const MILLISECONDS_SUSPICIOUS_THRESHOLD = 500

class TournamentRoom {
  private listeners = new Set<Listener>()
  private currentQuestion?: ActiveQuestion
  private closed = false
  private responses = new Map<string, TournamentResponse>()
  private fraudFlags: FraudFlag[] = []

  setActiveQuestion(
    question: Omit<TournamentQuestion, 'openedAt'> & { openedAt?: string },
  ) {
    const openedAt = question.openedAt ?? new Date().toISOString()
    const normalizedQuestion: ActiveQuestion = {
      id: question.id,
      prompt: question.prompt,
      deadline: new Date(question.deadline).toISOString(),
      openedAt,
    }
    this.currentQuestion = normalizedQuestion
    this.closed = false
    this.responses.clear()
    this.emit({ type: 'question', question: normalizedQuestion })
  }

  close(reason?: string) {
    this.closed = true
    this.emit({ type: 'closed', reason: reason ?? 'tournament_room_closed' })
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    if (this.currentQuestion) {
      listener({ type: 'question', question: this.currentQuestion })
    }
    if (this.closed && !this.currentQuestion) {
      listener({ type: 'closed', reason: 'tournament_room_closed' })
    }
    return () => this.listeners.delete(listener)
  }

  getStatus(): TournamentRoomStatus {
    return {
      closed: this.closed,
      currentQuestion: this.currentQuestion,
    }
  }

  getFraudFlags() {
    return [...this.fraudFlags]
  }

  submitResponse(payload: ResponsePayload): TournamentResponse {
    if (!this.currentQuestion) {
      this.recordFlag({
        reason: 'unknown_question',
        severity: 'blocked',
        details: 'Attempted to answer without an active question',
        participantId: payload.participantId,
        questionId: payload.questionId,
      })
      throw new Error('There is no active question at the moment')
    }

    if (this.closed) {
      this.recordFlag({
        reason: 'outside_window',
        severity: 'blocked',
        details: 'Room is closed for submissions',
        participantId: payload.participantId,
        questionId: payload.questionId,
      })
      throw new Error('Tournament room is closed')
    }

    if (payload.questionId !== this.currentQuestion.id) {
      this.recordFlag({
        reason: 'unknown_question',
        severity: 'blocked',
        details: 'Question ID does not match the active one',
        participantId: payload.participantId,
        questionId: payload.questionId,
      })
      throw new Error('Submitted question does not match the active question')
    }

    const now = new Date()
    const deadline = new Date(this.currentQuestion.deadline)
    const openedAt = new Date(this.currentQuestion.openedAt)

    if (now < openedAt || now > deadline) {
      this.recordFlag({
        reason: 'outside_window',
        severity: 'blocked',
        details: `Submission received outside of the active window (${openedAt.toISOString()} - ${deadline.toISOString()})`,
        participantId: payload.participantId,
        questionId: payload.questionId,
      })
      throw new Error('Submission outside of the allowed window')
    }

    const responseKey = `${payload.questionId}:${payload.participantId}`
    if (this.responses.has(responseKey)) {
      this.recordFlag({
        reason: 'duplicate_submission',
        severity: 'blocked',
        details: 'Duplicate submission detected for participant and question',
        participantId: payload.participantId,
        questionId: payload.questionId,
      })
      throw new Error('Duplicate submission detected')
    }

    const latencyMs = now.getTime() - openedAt.getTime()
    const suspiciousLatency = latencyMs < MILLISECONDS_SUSPICIOUS_THRESHOLD
    const nonce = payload.nonce ?? crypto.randomUUID()
    const receivedAt = now.toISOString()
    const hash = this.createHash({ ...payload, nonce, receivedAt, latencyMs })

    const response: TournamentResponse = {
      id: responseKey,
      questionId: payload.questionId,
      participantId: payload.participantId,
      answer: payload.answer,
      nonce,
      clientTimestamp: payload.clientTimestamp,
      receivedAt,
      latencyMs,
      suspiciousLatency,
      hash,
    }

    this.responses.set(responseKey, response)

    if (suspiciousLatency) {
      this.recordFlag({
        reason: 'suspicious_latency',
        severity: 'warning',
        details: `Latency too low (${latencyMs}ms)`,
        participantId: payload.participantId,
        questionId: payload.questionId,
      })
    }

    return response
  }

  private emit(event: TournamentEvent) {
    this.listeners.forEach(listener => listener(event))
  }

  private recordFlag(flag: Omit<FraudFlag, 'id' | 'createdAt'>) {
    this.fraudFlags.push({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...flag,
    })
  }

  private createHash(value: Record<string, unknown>) {
    const hash = crypto.createHash('sha256')
    hash.update(JSON.stringify(value))
    return hash.digest('hex')
  }
}

let room: TournamentRoom | undefined

export function getTournamentRoom() {
  if (!room) {
    room = new TournamentRoom()
  }
  return room
}
